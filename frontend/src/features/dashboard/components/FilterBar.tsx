import React from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import AgeRangeSlider from "./AgeRangeSlider";
import { useLanguage } from "../../../context/LanguageContext";
import { locationData } from "../../../data/locationData";

interface FilterBarProps {
  searchQuery: string;
  searchSubCaste: string;
  searchCountry: string;
  searchState: string;
  searchDistrict: string;
  searchTaluka: string;
  searchAgeMin: string;
  searchAgeMax: string;
  searchVerifiedOnly: boolean;
  searchOnlineOnly: boolean;
  searchMatchingOnly: boolean;
  filterDropdownOpen: boolean;
  filterRef: React.RefObject<HTMLDivElement | null>;
  onSearchQueryChange: (val: string) => void;
  onSearchSubCasteChange: (val: string) => void;
  onSearchCountryChange: (val: string) => void;
  onSearchStateChange: (val: string) => void;
  onSearchDistrictChange: (val: string) => void;
  onSearchTalukaChange: (val: string) => void;
  onSearchAgeMinChange: (val: string) => void;
  onSearchAgeMaxChange: (val: string) => void;
  onSearchVerifiedOnlyChange: (val: boolean) => void;
  onSearchOnlineOnlyChange: (val: boolean) => void;
  onSearchMatchingOnlyChange: (val: boolean) => void;
  onToggleFilterDropdown: () => void;
  onResetFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  searchSubCaste,
  searchCountry,
  searchState,
  searchDistrict,
  searchTaluka,
  searchAgeMin,
  searchAgeMax,
  searchVerifiedOnly,
  searchOnlineOnly,
  searchMatchingOnly,
  filterDropdownOpen,
  filterRef,
  onSearchQueryChange,
  onSearchSubCasteChange,
  onSearchCountryChange,
  onSearchStateChange,
  onSearchDistrictChange,
  onSearchTalukaChange,
  onSearchAgeMinChange,
  onSearchAgeMaxChange,
  onSearchVerifiedOnlyChange,
  onSearchOnlineOnlyChange,
  onSearchMatchingOnlyChange,
  onToggleFilterDropdown,
  onResetFilters,
}) => {
  const { t } = useLanguage();
  const hasActiveFilters = searchQuery || searchSubCaste || searchCountry || searchState || searchDistrict || searchTaluka || searchAgeMin !== "18" || searchAgeMax !== "70" || searchVerifiedOnly || searchOnlineOnly || searchMatchingOnly;

  return (
    <div className="relative min-w-[120px]" ref={filterRef}>
      <button
        onClick={onToggleFilterDropdown}
        className="w-full flex items-center justify-center gap-1.5 text-[11px] px-3 py-2 bg-maroon-50 dark:bg-maroon-950/20 rounded-xl text-maroon-700 dark:text-gold-400 font-bold cursor-pointer hover:bg-maroon-100/50 dark:hover:bg-maroon-900/30 transition-colors border border-slate-200 dark:border-dark-800"
      >
        <Filter className="h-3.5 w-3.5 shrink-0" />
        <span>{t("filter.more")}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform duration-250 ${filterDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

        {filterDropdownOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-dark-900 rounded-2xl shadow-xl border border-slate-200 dark:border-dark-800 p-4 z-[60] animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t("filter.refine")}</p>
            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="text-[10px] font-bold text-maroon-700 dark:text-gold-400 hover:underline cursor-pointer"
              >
                {t("filter.reset")}
              </button>
            )}
          </div>

          <AgeRangeSlider
            minVal={searchAgeMin ? parseInt(searchAgeMin) : 18}
            maxVal={searchAgeMax ? parseInt(searchAgeMax) : 70}
            setMinVal={(val) => onSearchAgeMinChange(val.toString())}
            setMaxVal={(val) => onSearchAgeMaxChange(val.toString())}
          />

          <div className="space-y-2 border-t border-slate-100 dark:border-dark-850 pt-3">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("filter.subcaste")}</label>
            <div className="relative">
              <select
                value={searchSubCaste}
                onChange={(e) => onSearchSubCasteChange(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-maroon-500 appearance-none cursor-pointer"
              >
                <option value="">{t("filter.all")}</option>
                <option value="Panchal">Panchal</option>
                <option value="Gadi Lohar">Gadi Lohar</option>
                <option value="Sangar">Sangar</option>
                <option value="Jhangra">Jhangra</option>
                <option value="Dhiman">Dhiman</option>
                <option value="Tarkhan">Tarkhan</option>
                <option value="Vishwakarma">Vishwakarma</option>
                <option value="Mathura Lohar">Mathura Lohar</option>
                <option value="Rajput Lohar">Rajput Lohar</option>
                <option value="Luhar">Luhar</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-dark-850 pt-3">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">{t("Location")}</label>
            
            {/* Country */}
            <div className="relative mb-2">
              <select
                value={searchCountry}
                onChange={(e) => {
                    onSearchCountryChange(e.target.value);
                    onSearchStateChange("");
                    onSearchDistrictChange("");
                    onSearchTalukaChange("");
                  }}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="">{t("filter.all")} {t("Countries")}</option>
                  {Object.keys(locationData).map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* State */}
            <div className="space-y-1 mt-3">
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">{t("State")}</label>
              <div className="relative">
                <select
                  value={searchState}
                  onChange={(e) => {
                    onSearchStateChange(e.target.value);
                    onSearchDistrictChange("");
                    onSearchTalukaChange("");
                  }}
                  disabled={!searchCountry}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{t("filter.all")} {t("States")}</option>
                  {searchCountry && Object.keys(locationData[searchCountry] || {}).map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* District */}
            <div className="space-y-1 mt-3">
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">{t("District")}</label>
              <div className="relative">
                <select
                  value={searchDistrict}
                  onChange={(e) => {
                    onSearchDistrictChange(e.target.value);
                    onSearchTalukaChange("");
                  }}
                  disabled={!searchState}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{t("filter.all")} {t("Districts")}</option>
                  {searchCountry && searchState && Object.keys(locationData[searchCountry]?.[searchState] || {}).map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Taluka */}
            <div className="space-y-1 mt-3">
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">{t("Taluka / City")}</label>
              <div className="relative">
                <select
                  value={searchTaluka}
                  onChange={(e) => onSearchTalukaChange(e.target.value)}
                  disabled={!searchDistrict}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{t("filter.all")} {t("Taluka / City")}</option>
                  {searchCountry && searchState && searchDistrict && (locationData[searchCountry]?.[searchState]?.[searchDistrict] || []).map(taluka => (
                    <option key={taluka} value={taluka}>{taluka}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

          <div className="border-t border-slate-100 dark:border-dark-850 pt-3 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-750 dark:text-slate-355 hover:text-maroon-700 dark:hover:text-gold-400">
              <input type="checkbox" checked={searchVerifiedOnly} onChange={(e) => onSearchVerifiedOnlyChange(e.target.checked)}
                className="rounded accent-maroon-700 h-3.5 w-3.5" />
              <span>{t("filter.verified")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-750 dark:text-slate-355 hover:text-maroon-700 dark:hover:text-gold-400">
              <input type="checkbox" checked={searchOnlineOnly} onChange={(e) => onSearchOnlineOnlyChange(e.target.checked)}
                className="rounded accent-maroon-700 h-3.5 w-3.5" />
              <span>{t("filter.online")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-750 dark:text-slate-355 hover:text-maroon-700 dark:hover:text-gold-400">
              <input type="checkbox" checked={searchMatchingOnly} onChange={(e) => onSearchMatchingOnlyChange(e.target.checked)}
                className="rounded accent-maroon-700 h-3.5 w-3.5" />
              <span>{t("filter.matching")}</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
