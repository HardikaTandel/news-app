import React from "react";
import { motion } from "framer-motion";

const RegionSelector = ({ selectedRegion, onRegionChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="region-selector"
    >
      <label>
        <strong>Region: </strong>
        <motion.select
          whileFocus={{ scale: 1.05 }}
          value={selectedRegion}
          onChange={onRegionChange}
        >
          <option value="in">Local (India)</option>
          <option value="us">Global (US)</option>
        </motion.select>
      </label>
    </motion.div>
  );
};

export default RegionSelector;
