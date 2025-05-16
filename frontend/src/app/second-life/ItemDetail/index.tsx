/**
 * ItemDetail Component for Second Life
 * 
 * This component displays detailed information about a selected repurposing idea
 * in a modal dialog, with a fixed header and scrollable description.
 */
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { ItemDetailProps } from "@/interfaces/SecondLifeItem";
import Image from 'next/image';

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
        body: "py-6",
        header: "border-b-[1px] border-[#2c5e2e]",
        footer: "border-t-[1px] border-[#2c5e2e]",
        closeButton: "hover:bg-[#2c5e2e]/5 active:bg-[#2c5e2e]/10"
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
                  <div className="relative w-full h-64">
                    <Image
                      src={item.picture}
                      alt={`${item.method_name} process`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm">
                  {item.method_category}
                </span>
              </div>
            </div>
            
            {/* Scrollable content */}
            <div className="px-6 overflow-y-auto" style={{ maxHeight: "calc(70vh - 350px)" }}>              
              {/* Handle case with explicit Requires section */}
              {item.description.includes('Requires:') && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-[#2c5e2e] mb-3">Ingredients & Materials</h3>
                  <div className="bg-[#f0f7f0] rounded-lg p-4">
                    {item.description
                      .split('Method:')[0]
                      .replace('Requires:', '')
                      .split('\n')
                      .filter(line => line.trim() !== '')
                      .map((line, idx) => (
                        <div key={idx} className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-[#2c5e2e]"></div>
                          <span className="text-gray-700">{line.trim()}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Handle case with explicit Method section */}
              {item.description.includes('Method:') ? (
                <div>
                  <h3 className="text-lg font-medium text-[#2c5e2e] mb-3">Steps</h3>
                  <div className="space-y-4">
                    {item.description
                      .split('Method:')[1]
                      .split('\n')
                      .filter(line => line.trim() !== '')
                      .map((line, idx) => (
                        <div key={idx} className="flex gap-4 items-start">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2c5e2e] text-white flex items-center justify-center">
                            {idx + 1}
                          </div>
                          <p className="text-gray-700 pt-1">{line.replace(`Step${idx + 1}:`, '').trim()}</p>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                // Handle case with no explicit sections but has steps or just plain text
                <div>
                  {item.description.includes('Step') ? (
                    <div className="space-y-4">
                      {item.description
                        .split('\n')
                        .filter(line => line.trim() !== '')
                        .flatMap(line => {
                          // If line contains multiple steps (Step2:, Step3:, etc)
                          if (line.match(/Step\s*[2-9]:/)) {
                            return line
                              .split(/(?=Step\s*\d+:)/) // Split on Step X: but keep the delimiter
                              .filter(part => part.trim() !== '')
                              .map(part => part.trim());
                          }
                          return [line];
                        })
                        .map((line, idx) => (
                          <div key={idx} className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2c5e2e] text-white flex items-center justify-center">
                              {idx + 1}
                            </div>
                            <p className="text-gray-700 pt-1">
                              {line.replace(/Step\s*\d+:\s*/i, '').trim()}
                            </p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    // Plain text description
                    <div className="prose prose-green max-w-none">
                      {item.description
                        .split('\n')
                        .filter(line => line.trim() !== '')
                        .map((line, idx) => (
                          <p key={idx} className="text-gray-700 mb-4">
                            {line.trim()}
                          </p>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 