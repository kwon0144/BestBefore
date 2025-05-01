/**
 * ItemDetail Component for Second Life
 * 
 * This component displays detailed information about a selected repurposing idea
 * in a modal dialog, with a fixed header and scrollable description.
 */
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { ItemDetailProps } from "../interfaces";

/**
 * Renders a modal with detailed information about a repurposing idea
 * 
 * @param {object} props - Component properties
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Object|null} props.item - Item to display details for
 * @returns {JSX.Element} Rendered item detail component
 */
export default function ItemDetail({ isOpen, onClose, item }: ItemDetailProps) {
  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      hideCloseButton
      classNames={{
        base: "max-w-3xl mx-auto",
        body: "p-0 overflow-hidden"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-[#2c5e2e]">
              {item.method_name}
            </h2>
            <Button
              isIconOnly
              onPress={onClose}
              className="bg-transparent hover:bg-gray-100 rounded-full p-2"
            >
              <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
            </Button>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col h-full">
            {/* Fixed content */}
            <div className="px-6">
              <div className="mb-6">
                {item.picture ? (
                  <img
                    src={item.picture}
                    alt={`${item.method_name} process`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-[#f0f7f0] text-[#2c5e2e] rounded-full text-sm">
                  {item.method_category}
                </span>
              </div>
            </div>
            
            {/* Scrollable content */}
            <div className="px-6 overflow-y-auto" style={{ maxHeight: "calc(70vh - 350px)" }}>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Description</h3>
                {item.description
                  .split('.')
                  .filter(line => line.trim() !== '')
                  .map((line, idx) => (
                    <div key={idx} className="text-gray-600 whitespace-pre-line mt-2">
                      {line.trim() + '.'}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 