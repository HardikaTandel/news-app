import React from "react";
import { motion } from "framer-motion";

const GenreSelector = ({ selectedGenre, onGenreChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="genre-selector"
    >
      <label>
        <strong>Genre: </strong>
        <motion.select
          whileFocus={{ scale: 1.05 }}
          value={selectedGenre}
          onChange={onGenreChange}
        >
          <option value="general">General</option>
          <option value="business">Business</option>
          <option value="sports">Sports</option>
          <option value="technology">Technology</option>
          <option value="entertainment">Entertainment</option>
          <option value="health">Health</option>
        </motion.select>
      </label>
    </motion.div>
  );
};

export default GenreSelector;
