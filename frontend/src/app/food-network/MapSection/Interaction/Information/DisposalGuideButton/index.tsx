import { faBook } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Modal, ModalContent, useDisclosure } from "@heroui/react";
import DisposalGuideContent from "./DisposalGuideContent"

export default function DisposalGuideButton() {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

return (
  <>
    <Button 
        onPress={onOpen}
        className="flex-1 bg-darkgreen text-white py-2 px-4 rounded-lg">
        <FontAwesomeIcon icon={faBook} className="mr-2" />
        Get Disposal Guide
    </Button>
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
            <DisposalGuideContent onClose={onClose} />
        )}
      </ModalContent>
    </Modal>
  </>
);
}