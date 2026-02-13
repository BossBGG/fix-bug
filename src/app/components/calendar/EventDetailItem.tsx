import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface EventDetailItemProps {
  icon: IconDefinition;
  label: string;
  value: string;
}

const EventDetailItem: React.FC<EventDetailItemProps> = ({ icon, label, value }) => {
  return (
    <div className="flex flex-wrap lg:flex-nowrap">
      <div className="flex w-full md:w-[50%]">
        <FontAwesomeIcon icon={icon} className="text-[#671FAB] w-4 mr-3" />
        <div className="text-[14px] text-[#57595B]">{label} : </div>
      </div>

      <div className="text-[14px] flex w-full">
        <div className="text-[#160C26]">{value}</div>
      </div>
    </div>
  );
};

export default EventDetailItem;
