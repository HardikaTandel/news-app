import axios from 'axios';

// Using spaCy API or local spaCy installation
class NERService {
  constructor() {
    this.apiUrl = process.env.SPACY_API_URL || 'http://localhost:8000';
  }

  // Extract entities from article text
  async extractEntities(text) {
    try {
      // Option 1: Using spaCy API
      const response = await axios.post(`${this.apiUrl}/extract-entities`, {
        text: text
      });
      
      return response.data.entities;
    } catch (error) {
      console.error('Error extracting entities:', error);
      return [];
    }
  }

  // Extract entities from multiple articles
  async extractEntitiesFromArticles(articles) {
    const entitiesPromises = articles.map(async (article) => {
      const text = `${article.title} ${article.description}`;
      const entities = await this.extractEntities(text);
      
      return {
        articleId: article.articleId,
        title: article.title,
        entities: entities
      };
    });

    return Promise.all(entitiesPromises);
  }

  // Get trending entities from articles
  async getTrendingEntities(articles, limit = 10) {
    const allEntities = [];
    
    for (const article of articles) {
      const text = `${article.title} ${article.description}`;
      const entities = await this.extractEntities(text);
      allEntities.push(...entities);
    }

    // Count entity frequency
    const entityCount = {};
    allEntities.forEach(entity => {
      const key = `${entity.text}-${entity.label}`;
      entityCount[key] = (entityCount[key] || 0) + 1;
    });

    // Sort by frequency and return top entities
    return Object.entries(entityCount)
      .map(([key, count]) => {
        const [text, label] = key.split('-');
        return { text, label, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // Find articles with similar entities
  async findRelatedArticles(targetArticle, allArticles, limit = 5) {
    const targetEntities = await this.extractEntities(
      `${targetArticle.title} ${targetArticle.description}`
    );
    
    const targetEntityTexts = targetEntities.map(e => e.text.toLowerCase());
    
    const relatedArticles = [];
    
    for (const article of allArticles) {
      if (article.articleId === targetArticle.articleId) continue;
      
      const articleEntities = await this.extractEntities(
        `${article.title} ${article.description}`
      );
      
      const articleEntityTexts = articleEntities.map(e => e.text.toLowerCase());
      
      // Calculate similarity score
      const commonEntities = targetEntityTexts.filter(text => 
        articleEntityTexts.includes(text)
      );
      
      if (commonEntities.length > 0) {
        relatedArticles.push({
          ...article,
          similarityScore: commonEntities.length,
          commonEntities
        });
      }
    }
    
    return relatedArticles
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
  }
}

export default new NERService(); 