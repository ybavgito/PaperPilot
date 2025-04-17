import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  IconButton,
  Collapse,
  Typography,
} from '@mui/material';
import { FilterList as FilterListIcon } from '@mui/icons-material';
import axios from 'axios';

interface SearchFiltersProps {
  onFiltersChange: (filters: any) => void;
}

const API_BASE_URL = 'http://localhost:8001';

const SearchFilters: React.FC<SearchFiltersProps> = ({ onFiltersChange }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [authors, setAuthors] = useState('');
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    onFiltersChange({
      categories: selectedCategories.join(','),
      date_from: dateFrom,
      date_to: dateTo,
      authors,
      sort_by: sortBy,
    });
  }, [selectedCategories, dateFrom, dateTo, authors, sortBy, onFiltersChange]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedCategories(event.target.value as string[]);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <IconButton onClick={() => setShowFilters(!showFilters)}>
          <FilterListIcon />
        </IconButton>
        <Typography variant="body2" sx={{ ml: 1 }}>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Typography>
      </Box>

      <Collapse in={showFilters}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
            >
              <MenuItem value="relevance">Relevance</MenuItem>
              <MenuItem value="lastUpdated">Last Updated</MenuItem>
              <MenuItem value="submitted">Submission Date</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Categories</InputLabel>
            <Select
              multiple
              value={selectedCategories}
              onChange={handleCategoryChange}
              input={<OutlinedInput label="Categories" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={categories[value] || value} />
                  ))}
                </Box>
              )}
            >
              {Object.entries(categories).map(([code, name]) => (
                <MenuItem key={code} value={code}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Authors (comma-separated)"
            value={authors}
            onChange={(e) => setAuthors(e.target.value)}
            sx={{ minWidth: 200 }}
          />

          <TextField
            label="Date From"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Date To"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

export default SearchFilters; 