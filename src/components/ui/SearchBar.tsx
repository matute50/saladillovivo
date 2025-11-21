'use client';

import React, { useState, useEffect } from 'react';
import { useNews } from '@/context/NewsContext';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

const SearchBar = () => {
  const { handleSearch, searchQuery } = useNews();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const debouncedQuery = useDebounce(localQuery, 400);

  useEffect(() => {
    // Sincronizar el estado local si la consulta global se borra desde otro lugar
    if (searchQuery !== localQuery) {
      setLocalQuery(searchQuery);
    }
  }, [searchQuery, localQuery]);

  useEffect(() => {
    // Ejecutar la búsqueda cuando el valor debounced cambia
    handleSearch(debouncedQuery);
  }, [debouncedQuery, handleSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(localQuery);
    }
  };

  const clearSearch = () => {
    setLocalQuery('');
    handleSearch(''); // Limpiar la búsqueda inmediatamente
  };

  return (
    <div className="relative flex items-center w-full max-w-[16rem] ml-4">
      <input
        type="text"
        value={localQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        maxLength={20}
        aria-label="Buscar videos"
        className="search-box w-full h-7 pl-10 pr-10 text-xs rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
      />
      <div className="absolute left-3 flex items-center pointer-events-none">
        <Search className="search-box-icon h-5 w-5" />
      </div>
      {localQuery && (
        <button
          onClick={clearSearch}
          className="absolute right-3 flex items-center justify-center text-gray-500 hover:text-white"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
