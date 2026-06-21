import React from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import AgeRangeSlider from "./AgeRangeSlider";
import { locationData } from "../../../data/locationData";
import { useLanguage } from "../../../context/LanguageContext";

interface SearchFiltersProps {
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
  advancedFilterOpen: boolean;
  advFilterRef: React.RefObject<HTMLDivElement | null>;
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
  onToggleAdvancedFilter: () => void;
  onResetFilters: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
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
  advancedFilterOpen,
  advFilterRef,
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
  onToggleAdvancedFilter,
  onResetFilters,
}) => {
  const { t } = useLanguage();
  return (
    <div className="flex items-center w-full">
      <div className="flex flex-grow items-center bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-dark-800/80 rounded-full shadow-sm divide-x divide-slate-100 dark:divide-dark-800 transition-all hover:border-maroon-700/30">
        {/* Search Keywords */}
        <div className="relative flex-grow min-w-[150px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("search.placeholder")}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-3 bg-transparent text-slate-900 dark:text-white focus:outline-none rounded-l-full"
          />
        </div>

        {/* Filter Icon */}
        <div className="relative shrink-0" ref={advFilterRef}>
          <button
            onClick={onToggleAdvancedFilter}
            className={`flex items-center gap-1.5 px-5 py-3 rounded-r-full font-bold text-xs cursor-pointer transition-colors focus:outline-none ${advancedFilterOpen ? 'bg-maroon-50 dark:bg-maroon-900/30 text-maroon-700 dark:text-gold-400' : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-850'}`}
          >
            <Filter className="h-4 w-4" />
            <span>{t("filter.more")}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-250 ${advancedFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {advancedFilterOpen && (
            <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-slate-200/80 dark:border-dark-800/80 p-5 shadow-xl bg-white dark:bg-dark-900 z-[60] space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t("filter.refine")}</p>
              <button
                onClick={onResetFilters}
                className="text-xs font-bold text-maroon-700 dark:text-gold-400 hover:underline cursor-pointer"
              >
                {t("filter.reset")}
              </button>
            </div>

            {/* Sub Caste inside dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">{t("filter.subcaste")}</label>
              <div className="relative">
                <select
                  value={searchSubCaste}
                  onChange={(e) => onSearchSubCasteChange(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="">{t("filter.all")} {t("filter.subcaste")}</option>
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

            {/* Location Filters */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">{t("Location")}</label>
              <div className="relative">
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

            <div className="space-y-1">
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

            <div className="space-y-1">
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

            <div className="space-y-1">
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

            <AgeRangeSlider
              minVal={searchAgeMin ? parseInt(searchAgeMin) : 18}
              maxVal={searchAgeMax ? parseInt(searchAgeMax) : 70}
              setMinVal={(val) => onSearchAgeMinChange(val.toString())}
              setMaxVal={(val) => onSearchAgeMaxChange(val.toString())}
            />

            <div className="border-t border-slate-100 dark:border-dark-850 my-2 pt-2 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-750 dark:text-slate-355 hover:text-maroon-700 dark:hover:text-gold-400">
                <input
                  type="checkbox"
                  checked={searchVerifiedOnly}
                  onChange={(e) => onSearchVerifiedOnlyChange(e.target.checked)}
                  className="rounded accent-maroon-700 h-3.5 w-3.5"
                />
                <span>{t("filter.verified")}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-750 dark:text-slate-355 hover:text-maroon-700 dark:hover:text-gold-400">
                <input
                  type="checkbox"
                  checked={searchOnlineOnly}
                  onChange={(e) => onSearchOnlineOnlyChange(e.target.checked)}
                  className="rounded accent-maroon-700 h-3.5 w-3.5"
                />
                <span>{t("filter.online")}</span>
              </label>
            </div>
          </div>
        )}
      </div>

      </div>
    </div>
  );
};

export default SearchFilters;
