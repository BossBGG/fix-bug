import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faClock,
  faUser,
  faPhone,
  faMapPin,
  faCog,
  faTimes, faFile
} from "@fortawesome/free-solid-svg-icons";
import EventDetailItem from "./EventDetailItem";
import {CalendarEvent} from "@/types";
import {formatJSDateTH} from "@/app/helpers/DatetimeHelper";
import {router} from "next/client";
import {useRouter} from "next/navigation";

interface EventDetailPopupProps {
  event: {
    title: string,
    extendedProps: CalendarEvent
  }
  onClose: () => void;
}

const EventDetailPopup: React.FC<EventDetailPopupProps> = ({ event, onClose }) => {
  const router = useRouter()
  const startWork = () => {
    let params = new URLSearchParams({
      id: event.extendedProps?.workOrderId as string,
      requestCode: event.extendedProps?.requestCode as string,
    });

    if(event.extendedProps?.status === 'M') {
      router.push(`/work_order/${event.extendedProps?.workOrderId}`);
    }else if(event.extendedProps?.status === 'W') {
      params.append("isEdit", "true");
      router.push(`/work_order/create_or_update?${params.toString()}`);
    }else {
      //O,K,B,J,T,X,Y,Z
      params.append("isExecute", "true");
      router.push(`/work_order/create_or_update?${params.toString()}`)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
      >
        <FontAwesomeIcon icon={faTimes} size="lg" />
      </button>

      <h3 className="text-xl font-bold text-gray-900 mb-4 pr-6">
        {event.title || "-"}
      </h3>

      <div className="space-y-3">
        <EventDetailItem icon={faCalendar} label="วันที่" value={event.extendedProps?.appointmentDate ? formatJSDateTH(new Date(event.extendedProps.appointmentDate), 'dd MMMM yyyy') : "-"} />
        <EventDetailItem icon={faClock} label="เวลาที่นัดหมาย" value={event.extendedProps?.appointmentDate ? formatJSDateTH(new Date(event.extendedProps.appointmentDate), 'HH:mm น.') : "-"} />
        <EventDetailItem icon={faUser} label="ข้อมูลลูกค้า" value={event.extendedProps?.customerName || "-"} />
        <EventDetailItem icon={faPhone} label="เบอร์ติดต่อมือถือ" value={event.extendedProps?.customerMobileNo || "-"} />
        <EventDetailItem icon={faMapPin} label="สถานที่" value={event.extendedProps?.customerAddress || "-"} />
        <EventDetailItem icon={faCog} label="ประเภทงานบริการ" value={event.extendedProps?.workTypeName || "-"} />
      </div>

      <button className="w-full bg-purple-600 text-white py-3 rounded-full mt-6 hover:bg-purple-700 transition-colors cursor-pointer"
              onClick={() => startWork()}
      >
        เริ่มปฏิบัติงาน
      </button>

      <div className="mt-4 mb-2 space-y-1">
        <div className="text-[14px] mb-3">
          <div className="text-[#57595B]">รายละเอียด: </div>
          <div className="text-[#160C26]">{event.title || "-"}</div>
        </div>

        <EventDetailItem icon={faFile} label={"เลขที่คำร้อง:"} value={event.extendedProps?.customerRequestNo || "-"}/>
      </div>
    </div>
  );
};

export default EventDetailPopup;
