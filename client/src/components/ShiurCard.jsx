import React from 'react';

const ShiurCard = ({ shiur, isSelected, onToggle, selectionMode = 'view', showRabbi = true }) => {
  const handleExternalClick = (e) => {
    e.stopPropagation();
    window.open(shiur.url, '_blank', 'noopener,noreferrer');
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSelectionBorder = () => {
    if (!isSelected) return 'border-gray-200';
    switch (selectionMode) {
      case 'interest': return 'border-blue-500 ring-2 ring-blue-200';
      case 'favorite': return 'border-yellow-500 ring-2 ring-yellow-200';
      default: return 'border-primary-500 ring-2 ring-primary-200';
    }
  };

  return (
    <div 
      className={`card p-4 cursor-pointer transition-all duration-200 border-2 ${getSelectionBorder()}`}
      onClick={selectionMode !== 'view' ? onToggle : undefined}
    >
      {/* Selection indicator */}
      {selectionMode !== 'view' && (
        <div className="flex justify-between items-start mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(shiur.level)}`}>
            {shiur.level}
          </span>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            isSelected 
              ? selectionMode === 'favorite' 
                ? 'bg-yellow-500 border-yellow-500' 
                : 'bg-blue-500 border-blue-500'
              : 'border-gray-300'
          }`}>
            {isSelected && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      )}

      {selectionMode === 'view' && (
        <div className="flex justify-between items-start mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(shiur.level)}`}>
            {shiur.level}
          </span>
          <div className="flex items-center text-gray-500 text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {shiur.views}
          </div>
        </div>
      )}

      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {shiur.title}
      </h3>

      {shiur.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {shiur.description}
        </p>
      )}

      {showRabbi && shiur.rabbi && shiur.rabbi.name && (
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
            <span className="text-xs font-medium text-gray-600">
              {typeof shiur.rabbi.name === 'string' ? shiur.rabbi.name.split(' ').map(n => n[0]).join('') : ''}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {shiur.rabbi.name}
          </span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          {shiur.duration && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {shiur.duration}
            </div>
          )}
          {shiur.topic && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              {shiur.topic}
            </span>
          )}
        </div>

        <button
          onClick={handleExternalClick}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
        >
          Listen
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ShiurCard;