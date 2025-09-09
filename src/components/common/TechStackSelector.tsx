'use client';

import React, { useState, useRef, useEffect } from 'react';
import { skillService, SkillResponse } from '@/services/skillService';
import { getTechIcon } from '@/lib/techIcons';

interface TechStackSelectorProps {
  selectedTechStacks: string[];
  onTechStackChange: (techStacks: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
}

export default function TechStackSelector({
  selectedTechStacks = [],
  onTechStackChange = () => {},
  placeholder = "기술 스택을 검색하여 추가하세요",
  maxSelections
}: TechStackSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [availableSkills, setAvailableSkills] = useState<SkillResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 안전한 기본값 설정
  const safeSelectedTechStacks = selectedTechStacks || [];

  // CloudFront URL에 프로토콜 추가
  const formatImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  // 검색 결과 필터링
  const filteredTechStacks = availableSkills.filter(skill => 
    skill.skillName.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !safeSelectedTechStacks.includes(skill.skillName)
  );

  // 기술 스택 데이터 로드
  const loadSkills = async (force = false) => {
    if (hasLoaded && !force) return;
    
    setIsLoading(true);
    try {
      const response = await skillService.getAllSkills(0, 100); // 모든 기술 스택 가져오기
      setAvailableSkills(response.skills);
      setHasLoaded(true);
    } catch (error) {
      console.error('기술 스택 로드 실패:', error);
      setAvailableSkills([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 기술 스택 로드
  useEffect(() => {
    loadSkills();
  }, []);

  // 외부 클릭시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen && e.key !== 'Enter') {
      setIsDropdownOpen(true);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredTechStacks.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredTechStacks.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredTechStacks.length) {
          handleSelectTechStack(filteredTechStacks[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // 기술 스택 선택
  const handleSelectTechStack = (skill: SkillResponse) => {
    if (maxSelections && safeSelectedTechStacks.length >= maxSelections) {
      alert(`최대 ${maxSelections}개까지만 선택할 수 있습니다.`);
      return;
    }

    if (!safeSelectedTechStacks.includes(skill.skillName)) {
      onTechStackChange([...safeSelectedTechStacks, skill.skillName]);
    }
    setSearchQuery('');
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
    
    // 선택 후 전체 목록을 다시 로드
    loadSkills(true);
  };

  // 기술 스택 제거
  const handleRemoveTechStack = (techStackName: string) => {
    onTechStackChange(safeSelectedTechStacks.filter(name => name !== techStackName));
  };

  // 검색 기능
  const searchSkills = async (query: string) => {
    if (!query.trim()) {
      // 검색어가 없으면 전체 스킬을 다시 로드
      await loadSkills(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await skillService.searchSkills(query);
      setAvailableSkills(response.skills);
    } catch (error) {
      console.error('기술 스택 검색 실패:', error);
      setAvailableSkills([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 입력 변경
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsDropdownOpen(true);
    setHighlightedIndex(-1);
    
    // 실시간 검색 (디바운싱 없이)
    searchSkills(value);
  };

  // 카테고리별 그룹화
  const groupedTechStacks = filteredTechStacks.reduce((acc, skill) => {
    const category = skill.category || '기타';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, SkillResponse[]>);

  return (
    <div className="space-y-3">
      {/* 선택된 기술 스택 표시 */}
      {safeSelectedTechStacks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {safeSelectedTechStacks.map((techName) => (
            <span
              key={techName}
              className="linear-tag text-xs flex items-center gap-2"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                {(() => {
                  const skill = availableSkills.find(s => s.skillName === techName);
                  return skill?.uploadUrl ? (
                    <img 
                      src={formatImageUrl(skill.uploadUrl)} 
                      alt={techName}
                      className="w-4 h-4 object-contain skill-icon"
                      onError={(e) => {
                        // 이미지 로드 실패시 목업 아이콘으로 폴백
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex; color: var(--color-accent-primary);');
                      }}
                    />
                  ) : (
                    <div style={{ color: 'var(--color-accent-primary)' }}>
                      {getTechIcon(techName)}
                    </div>
                  );
                })()}
                <div style={{ display: 'none', color: 'var(--color-accent-primary)' }}>
                  {getTechIcon(techName)}
                </div>
              </div>
              {techName}
              <button
                type="button"
                onClick={() => handleRemoveTechStack(techName)}
                className="text-red-400 hover:text-red-300 ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 검색 입력 */}
      <div className="relative" ref={dropdownRef}>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsDropdownOpen(true)}
          className="linear-input w-full"
          placeholder={placeholder}
        />

        {/* 드롭다운 */}
        {isDropdownOpen && (
          <div 
            className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto rounded-lg border shadow-lg"
            style={{ 
              backgroundColor: 'var(--color-bg-secondary)',
              borderColor: 'var(--color-border-secondary)'
            }}
          >
            {isLoading ? (
              <div className="p-3 text-center">
                <p className="linear-text-small" style={{ color: 'var(--color-text-secondary)' }}>
                  로딩 중...
                </p>
              </div>
            ) : filteredTechStacks.length === 0 ? (
              <div className="p-3 text-center">
                <p className="linear-text-small" style={{ color: 'var(--color-text-secondary)' }}>
                  {searchQuery ? '검색 결과가 없습니다.' : '모든 기술 스택이 선택되었습니다.'}
                </p>
              </div>
            ) : (
              <div className="py-1">
                {Object.entries(groupedTechStacks).map(([category, skills]) => (
                  <div key={category}>
                    {/* 카테고리 헤더 */}
                    <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--color-border-tertiary)' }}>
                      <p className="linear-text-mini font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                        {category}
                      </p>
                    </div>
                    
                    {/* 기술 스택 목록 */}
                    {skills.map((skill, index) => {
                      const globalIndex = filteredTechStacks.indexOf(skill);
                      const isHighlighted = globalIndex === highlightedIndex;
                      
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => handleSelectTechStack(skill)}
                          className={`w-full px-3 py-2 text-left flex items-center gap-3 transition-colors ${
                            isHighlighted ? 'bg-blue-600/20' : 'hover:bg-gray-700/50'
                          }`}
                        >
                          <div className="w-5 h-5 flex items-center justify-center">
                            {skill.uploadUrl ? (
                              <img 
                                src={formatImageUrl(skill.uploadUrl)} 
                                alt={skill.skillName}
                                className="w-5 h-5 object-contain skill-icon"
                                onError={(e) => {
                                  // 이미지 로드 실패시 목업 아이콘으로 폴백
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex; color: var(--color-accent-primary);');
                                }}
                              />
                            ) : (
                              <div style={{ color: 'var(--color-accent-primary)' }}>
                                {getTechIcon(skill.skillName)}
                              </div>
                            )}
                            <div style={{ display: 'none', color: 'var(--color-accent-primary)' }}>
                              {getTechIcon(skill.skillName)}
                            </div>
                          </div>
                          <span className="linear-text-small">{skill.skillName}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 선택 제한 표시 */}
      {maxSelections && (
        <p className="linear-text-mini" style={{ color: 'var(--color-text-tertiary)' }}>
          {safeSelectedTechStacks.length}/{maxSelections} 선택됨
        </p>
      )}
    </div>
  );
}