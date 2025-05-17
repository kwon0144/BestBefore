/**
 * ItemsGrid Component for Second Life
 * 
 * This component displays a grid of food waste repurposing ideas,
 * with pagination and loading states.
 */
import { forwardRef } from "react";
import { Pagination, Skeleton } from "@heroui/react";
import { SecondLifeItem } from "@/app/second-life/interfaces/SecondLifeItem";
import Image from 'next/image';
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import InfoTooltip from "@/app/(components)/InfoTooltip";

/**
 * Props for the ItemsGrid component
 * Used to display grid of Second Life items with pagination
 */
export interface ItemsGridProps {
  items: SecondLifeItem[];
  allItems: SecondLifeItem[];
  filteredItemsCount: number;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  handleCardClick: (item: SecondLifeItem) => void;
  handlePageChange: (page: number) => void;
}

/**
 * Renders a grid of repurposing items with pagination
 * 
 * @param {object} props - Component properties
 * @param {Array} props.items - Items to display on current page
 * @param {Array} props.allItems - All items (for count display)
 * @param {boolean} props.loading - Loading state
 * @param {string|null} props.error - Error message if any
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.handleCardClick - Function to handle card click
 * @param {Function} props.handlePageChange - Function to handle page change
 * @returns {JSX.Element} Rendered items grid component
 */
const ItemsGrid = forwardRef<HTMLDivElement, ItemsGridProps>(({
  items,
  filteredItemsCount,
  loading,
  error,
  currentPage,
  totalPages,
  handleCardClick,
  handlePageChange
}, ref) => {
  return (
    <div ref={ref} className="mt-8 mb-20">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          {filteredItemsCount} DIY idea{filteredItemsCount !== 1 ? 's' : ''} available
        </h3>
        <InfoTooltip 
            contentItems={[
              "DIY ideas provided are based on open data sources and general information",
              "When using food scraps for DIY projects, ensure they are properly cleaned and safe for the intended purpose",
              "Always verify ingredient safety, especially when repurposing food items for non-food applications"
            ]}
            header="For Reference Only"
            footerText="Recommendations for reference only"
            placement="left-start"
            icon={faCircleExclamation}
            ariaLabel="Disclaimer"
          />
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 bg-[#f0f7f0] min-h-[160px]">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <div
                key={item.method_id}
                onClick={() => handleCardClick(item)}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100"
              >
                <div className="relative h-56 overflow-hidden">
                  {item.picture ? (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent z-10" />
                      <div className="relative w-full h-full">
                        <Image
                          src={item.picture}
                          alt={item.method_name}
                          fill
                          quality={75}
                          loading="lazy"
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          style={{ position: 'absolute' }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No image available</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 z-20">
                    <span className="text-xs font-medium py-1.5 px-3 bg-white/90 backdrop-blur-sm text-amber-700 rounded-full shadow-sm">
                      {item.method_category}
                    </span>
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-b from-[#f8faf8] to-white">
                  <h3 className="text-xl font-semibold text-[#2c5e2e] mb-2 line-clamp-1 group-hover:text-[#1f4521]">
                    {item.method_name}
                  </h3>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {item.ingredient.split(',').map((ing, idx) => (
                      <span 
                        key={idx} 
                        className="text-xs py-1 px-2 bg-[#f0f7f0] text-[#2c5e2e] rounded-md"
                      >
                        {ing.trim()}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center text-[#2c5e2e] text-sm">
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      View details →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <Pagination
                total={totalPages}
                initialPage={currentPage}
                onChange={handlePageChange}
                variant="light"
                classNames={{
                  cursor: "bg-[#2c5e2e]",
                  item: "text-[#2c5e2e] hover:bg-[#f0f7f0]",
                  wrapper: "gap-2"
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
});

ItemsGrid.displayName = 'ItemsGrid';

export default ItemsGrid; 