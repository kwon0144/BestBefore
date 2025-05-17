/**
 * FoodNetworkList Component
 * 
 * This component displays a searchable and filterable list of food banks and waste disposal points.
 * Features include:
 * - Search by name, address, or location
 * - Filter by type (Food Bank or Green Waste)
 * - Pagination for large lists
 * - Interactive table with clickable rows
 * - Visual indicators for different types of locations
 */
'use client';

import React, { useState, useEffect, useMemo, SetStateAction, Dispatch } from 'react';
import { Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Select, SelectItem } from "@heroui/react";
import { Foodbank } from '@/app/api/foodbanks/route';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faRecycle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { ViewState, MapSectionState } from '../interfaces';
import { config } from '@/config';
/**
 * Props interface for the FoodNetworkList component
 * @interface
 */
interface FoodNetworkListProps {
  /** Function to update map section state */
  setMapSectionState: Dispatch<SetStateAction<MapSectionState>>;
  /** Currently selected point type */
  selectedType: string;
  /** Function to update selected point type */
  setSelectedType: Dispatch<SetStateAction<string>>;  
  /** Function to update view state */
  setViewState: Dispatch<SetStateAction<ViewState>>;
}

/**
 * Available type options for filtering
 * @constant
 */
const typeOptions = [
  { uid: "all", name: "All Types" },
  { uid: "Food Donation Point", name: "Food Bank" },
  { uid: "Green Waste", name: "Green Waste" },
];

/**
 * Renders a searchable and filterable list of food banks and waste disposal points
 * 
 * @param {object} props - Component properties
 * @param {Dispatch<SetStateAction<MapSectionState>>} props.setMapSectionState - Function to update map section state
 * @param {string} props.selectedType - Currently selected point type
 * @param {Dispatch<SetStateAction<string>>} props.setSelectedType - Function to update selected point type
 * @param {Dispatch<SetStateAction<ViewState>>} props.setViewState - Function to update view state
 * @returns {JSX.Element} Rendered food network list with search and filter capabilities
 */
const FoodNetworkList: React.FC<FoodNetworkListProps> = ({ 
  setMapSectionState, 
  selectedType,
  setSelectedType,
  setViewState
}) => {
  const [foodbanks, setFoodbanks] = useState<Foodbank[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchFoodbanks = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/api/foodbanks/`);
        if (!response.ok) {
          throw new Error('Failed to fetch foodbanks');
        }
        const data = await response.json();
        
        if (data.status === 'success' && Array.isArray(data.data)) {
          const processedData = data.data.map((item: Foodbank) => ({
            ...item,
            address: item.address || `Coordinates: ${item.latitude}, ${item.longitude}`
          }));
          
          setFoodbanks(processedData);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching foodbanks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodbanks();
  }, []);

  const filteredFoodbanks = useMemo(() => {
    let filtered = foodbanks;

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(foodbank => {
        // If "Food Donation Point" is selected, show only "Food Donation Point" types
        if (typeFilter === "Food Donation Point") {
          return foodbank.type === "Food Donation Point";
        }
        // If "Green Waste" is selected, show only non-"Food Donation Point" types
        if (typeFilter === "Green Waste") {
          return foodbank.type !== "Food Donation Point";
        }
        return true;
      });
    }

    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(foodbank => 
        foodbank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (foodbank.address && foodbank.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [searchTerm, foodbanks, typeFilter]);

  const pages = Math.ceil(filteredFoodbanks.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredFoodbanks.slice(start, end);
  }, [page, filteredFoodbanks, rowsPerPage]);

  const onTypeSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
    setPage(1)
  };

  if (loading) {
    return <div className="p-4">Loading foodbanks...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  const handleSelectFoodbank = (foodbank: Foodbank) => {
    // Check if the foodbank type matches the selected type
    if (foodbank.type === "Food Donation Point" && selectedType !== "Food Donation Points") {
      setSelectedType("Food Donation Points");
    } else if (foodbank.type !== "Food Donation Point" && selectedType !== "Waste Disposal Points") {
      setSelectedType("Waste Disposal Points");
    }
    setMapSectionState(prev => ({...prev, selectedEnd: foodbank.id.toString()}));

    // Scroll to top of the page
    window.scrollTo({ top: 700, behavior: 'smooth' });
    setViewState({ showInformation: true, showNavigation: false, showRouteResult: false});
  };

  return (
    <div>
        {/* <div className="flex flex-row gap-4 mb-6 items-center justify-between"> */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Title */}
          <h1 className="text-2xl font-semibold text-darkgreen">Food Network List in City of Melbourne </h1>
          <div className="flex flex-row gap-4">
            {/* Search Bar */}
            <Input
              isClearable
              placeholder="Search by name, address, postcode, suburb..."
              value={searchTerm}
              onValueChange={(value) => {
                setSearchTerm(value);
                setPage(1);
              }}
              onClear={() => {
                setSearchTerm("");
                setPage(1);
              }}
              variant="bordered"
              startContent={<FontAwesomeIcon icon={faSearch} />}
              classNames={{
                inputWrapper: "bg-white border-1 min-h-[48px]",
              }}
            />
            {/* Type Filter */}
            <Select
              className="w-[200px] h-[48px]"
              defaultSelectedKeys={["all"]}
              label="Type"
              placeholder="Select type"
              selectedKeys={[typeFilter]}
              onChange={onTypeSelectionChange}
              labelPlacement='outside-left'
              classNames={{
                trigger: "bg-white min-h-[48px] border-1",
                label: "hidden",
                value: "text-sm",
              }}
            >
              {typeOptions.map((type) => (
                <SelectItem key={type.uid} className="capitalize">
                  {type.name}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
        {/* Network List*/}
        <Table 
          aria-label="Food Network List in Melbourne City"
          removeWrapper
          classNames={{
            th: "bg-white",
            td: "bg-gray-100/50",
          }}
          bottomContent={
            <div className="flex justify-center">
              <Pagination
                showControls
                total={pages}
                classNames={{
                  item: "bg-green/20",
                }}
                color="primary"
                page={page}
                onChange={setPage}
              />
            </div>
          }
        >
          <TableHeader className="bg-white">
            <TableColumn className="w-[250px] bg-green/50 text-black font-bold">NAME</TableColumn>
            <TableColumn className="w-[400px] bg-green/50 text-black font-bold">ADDRESS</TableColumn>
            <TableColumn className="w-[150px] bg-green/50 text-black font-bold">TYPE</TableColumn>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((foodbank) => (
                <TableRow 
                  key={foodbank.id}
                  className="cursor-pointer border-b border-gray-300 hover:bg-[#fcc277]/30"
                  onClick={() => handleSelectFoodbank(foodbank)}
                >
                  <TableCell className="w-[250px] font-medium">{foodbank.name}</TableCell>
                  <TableCell className="w-[400px]">{foodbank.address || "No address available"}</TableCell>
                  <TableCell className="w-[150px]">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        foodbank.type === "Food Donation Point" 
                          ? "text-darkgreen bg-primary/50" 
                          : "text-[#15803d] bg-[#b0ebc4]"
                      }`}
                    >
                      {foodbank.type === "Food Donation Point" ? (
                        <>
                          <FontAwesomeIcon icon={faUtensils} className="w-3.5 h-3.5" />
                          Food Bank
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faRecycle} className="w-3.5 h-3.5" />
                          Green Waste
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-lg font-medium text-gray-600">No results found</p>
                    <p className="text-sm text-gray-500">
                      There is no Foodbank or Green Waste bin in this area. Try searching for a different location.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
      </Table>
    </div>
  );
};

export default FoodNetworkList;