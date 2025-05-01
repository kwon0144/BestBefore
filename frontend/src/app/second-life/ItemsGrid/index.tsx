/**
 * ItemsGrid Component for Second Life
 * 
 * This component displays a grid of repurposing ideas with pagination.
 */
import { Pagination } from "@heroui/react";
import { ItemsGridProps } from "../interfaces";

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
export default function ItemsGrid({
  items,
  allItems,
  loading,
  error,
  currentPage,
  totalPages,
  handleCardClick,
  handlePageChange
}: ItemsGridProps) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-700 mb-4">
        {allItems.length} items found
      </h3>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.method_id}
                onClick={() => handleCardClick(item)}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="h-48 overflow-hidden">
                  {item.picture ? (
                    <img
                      src={item.picture}
                      alt={item.method_name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-[#2c5e2e] mb-2">{item.method_name}</h3>
                  <p className="text-gray-600 mb-4">{item.ingredient}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs py-1 px-3 bg-[#f0f7f0] text-[#2c5e2e] rounded-full">
                      {item.method_category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <Pagination
                total={totalPages}
                initialPage={currentPage}
                onChange={handlePageChange}
                variant="light"
                classNames={{
                  cursor: "bg-[#2c5e2e]",
                  item: "text-[#2c5e2e]",
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
} 