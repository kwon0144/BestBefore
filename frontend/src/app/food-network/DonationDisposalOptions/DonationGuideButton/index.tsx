import { faBook } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Modal, ModalContent, useDisclosure } from "@heroui/react";
import DonationGuideContent from "./DonationGuideContent";

export default function DonationGuideButton() {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

return (
  <>
    <Button 
        onPress={onOpen}
        className="flex-1 bg-green text-white py-2 px-4 rounded-lg">
        <FontAwesomeIcon icon={faBook} className="mr-2" />
        Get Donation Guide
    </Button>
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
            <DonationGuideContent onClose={onClose} />
        )}
      </ModalContent>
    </Modal>
  </>
);
}