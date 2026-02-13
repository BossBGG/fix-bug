import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronLeft, faChevronRight} from "@fortawesome/free-solid-svg-icons";
import {formatJSDate, formatJSDateTH} from "@/app/helpers/DatetimeHelper";
import InputSelect from "@/app/components/form/InputSelect";
import InputDateButton from "@/app/components/form/InputDateButton";
import {InputMonthPicker} from "@/app/components/form/InputMonthPicker";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {th} from "date-fns/locale";
import {Card} from "@/components/ui/card";
import EventDetailPopup from "@/app/components/calendar/EventDetailPopup";
import {useEffect, useRef, useState} from "react";
import {getWorkOrdersByMonth} from "@/app/api/WorkOrderApi";
import {getWorkOrdersByDay} from "@/app/api/WorkOrderApi";
import {CalendarEvent} from "@/types";
import {DESKTOP_SCREEN, MOBILE_SCREEN, TABLET_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";
import {useAppSelector} from "@/app/redux/hook";

type MyCalendarProps = {
  title?: string,
  viewMode: string
}

const MyCalendar: React.FC<MyCalendarProps> = ({
                                                 title="ตารางงานของฉัน",
                                                 viewMode
                                               }) => {
  const calendarRef = useRef<FullCalendar>(null);
  const [calendarMode, setCalendarMode] = useState<'timeGridDay' | 'dayGridMonth' | string>('timeGridDay'); // ถ้าจะให้มีตัวเลือกสัปดาห์ ให้เพิ่ม timeGridWeek
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showPopup, setShowPopup] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [popoverPosition, setPopoverPosition] = useState<{x: number, y: number} | null>(null);
  const screenSize = useAppSelector((state) => state.screen_size)
  const popupRef = useRef<HTMLDivElement>(null);

  const fetchWorkOrders = async (date?: Date) => {
    const targetDate = date || selectedDate || new Date()
    if (calendarMode === 'dayGridMonth') {
      const month = targetDate.getMonth() + 1;
      const year = targetDate.getFullYear();
      const res = await getWorkOrdersByMonth(month, year, viewMode.toLowerCase());
      if(res.status === 200 && res.data?.data) {
        let calendarEvent: CalendarEvent[] = []
        res.data.data?.calendar?.map((data) => {
          if(data.workOrders?.length > 0) {
            data.workOrders.map((workOrder) => {
              const item = {
                title: workOrder.workTypeName,
                start: new Date(workOrder.appointmentDate),
                backgroundColor: workOrder.workType === "work" ? "#E1D2FF" : "#FDE5B6",
                borderColor: workOrder.workType === "work" ? "#E1D2FF" : "#FDE5B6",
                textColor: 'black',
                ...workOrder
              }

              calendarEvent.push(item)
            })
          }
        })

        setEvents(calendarEvent)
      }
    } else {
      const dateStr = formatJSDate(targetDate, 'yyyy-MM-dd')
      const res = await getWorkOrdersByDay(dateStr, viewMode.toLowerCase());
      if(res.status === 200 && res.data?.data) {
        let calendarEvent: CalendarEvent[] = []
        res.data.data?.workOrders?.map((data) => {
          const eventItem = {
            title: data.workTypeName,
            start: new Date(data.appointmentDate as string),
            backgroundColor: data.workType === "work" ? "#E1D2FF" : "#FDE5B6",
            borderColor: data.workType === "work" ? "#E1D2FF" : "#FDE5B6",
            textColor: 'black',
            ...data
          } as CalendarEvent

          calendarEvent.push(eventItem)
        })

        setEvents(calendarEvent)
      }
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [calendarMode, viewMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);

  const handleChangeView = (view: "timeGridDay" | "dayGridMonth" | string | number) => {
    setCalendarMode(view as string)
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.changeView(view as string)
    const currentDate = calendarApi?.getDate()
    if (currentDate) {
      setSelectedDate(currentDate)
      fetchWorkOrders(currentDate)
    }
  }

  const handlePrev = async () => {
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.prev()

    const currentDate = calendarApi?.getDate()
    if (!currentDate) return
    setSelectedDate(currentDate)
    await fetchWorkOrders(currentDate)
  }

  const handleNext = async () => {
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.next()

    const currentDate = calendarApi?.getDate()
    if (!currentDate) return
    setSelectedDate(currentDate)
    await fetchWorkOrders(currentDate)
  }

  const handleToday = async () => {
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.today()
    const currentDate = calendarApi?.getDate()
    if (!currentDate) return
    setSelectedDate(currentDate)
    await fetchWorkOrders(currentDate)
  }

  const handleDateChange = async (date: Date | undefined) => {
    if (!date) return
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.gotoDate(date)
    setSelectedDate(date)
    await fetchWorkOrders(date)
  }

  const handleMonthChange = async (date: Date) => {
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.gotoDate(date)
    setSelectedDate(date)
    await fetchWorkOrders(date)
  }

  const handleEventMouseEnter = (info: any) => {
    const popover = document.querySelector('.fc-popover');
    const screenWidth = window.innerWidth;
    const popupWidth = screenSize === DESKTOP_SCREEN ? 400 : 320; // ประมาณความกว้างของ popup

    if (popover && screenSize === DESKTOP_SCREEN) {
      const rect = popover.getBoundingClientRect();
      let x = rect.right + 10;
      let y = rect.top - 100;

      // ตรวจสอบว่า popup จะหลุดออกนอกจอด้านขวาหรือไม่
      if (x + (popupWidth + 200) > screenWidth) {
        x = rect.left - popupWidth - 180; // แสดงทางซ้ายแทน
      }

      // ตรวจสอบว่า popup จะหลุดออกนอกจอด้านบนหรือไม่
      if (y < 0) {
        y = 10;
      }

      setPopoverPosition({ x, y });
    } else {
      // Mobile/Tablet: แสดงตรงกลางจอ
      setPopoverPosition({
        x: (screenWidth - popupWidth) / 2,
        y: 100
      });
    }

    setSelectedEvent(info.event._def);
    setShowPopup(true);
  }

  const handleMobileEventClick = (date: Date) => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.gotoDate(date);
    calendarApi?.changeView('timeGridDay');
    setCalendarMode('timeGridDay');
    setSelectedDate(date);
  }

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedEvent(null);
  }

  return (
    <Card className="p-4">
      <div className="text-[#160C26] font-semibold my-3">{title}</div>
      <div className="flex justify-between items-center -my-2 flex-wrap">
        {
          calendarMode === 'timeGridDay' || calendarMode === 'dayGridMonth' ?
            (
              <div className="flex items-center gap-2">
                <button
                  className="pea-button-outline whitespace-nowrap !px-3 !py-2 rounded-md text-[10px] md:text-[14px] cursor-pointer"
                  onClick={handleToday}
                >
                  วันนี้
                </button>

                <button
                  className="px-3 py-1 rounded-md cursor-pointer"
                  onClick={handlePrev}
                >
                  <FontAwesomeIcon icon={faChevronLeft} color="#671FAB"/>
                </button>
                <button
                  className="px-3 py-1 rounded-md cursor-pointer"
                  onClick={handleNext}
                >
                  <FontAwesomeIcon icon={faChevronRight} color="#671FAB"/>
                </button>

                <div className="text-[12px] md:text-[14px]">
                  {
                    selectedDate && formatJSDateTH(
                      selectedDate,
                      calendarMode === 'dayGridMonth' ? 'MMMM yyyy' : 'dd MMMM yyyy'
                    )
                  }
                </div>
              </div>
            ) : <div></div>
        }

        <div className="flex items-center gap-2 flex-wrap mt-3 lg:mt-0">
          <div className="md:w-40 lg:w-25">
            <InputSelect options={[
              {value: "timeGridDay", label: "วัน"},
              // {value: "timeGridWeek", label: "สัปดาห์"},
              {value: "dayGridMonth", label: "เดือน"}
            ]}
                         value={calendarMode}
                         placeholder={""}
                         setData={handleChangeView}
                         className="rounded-full text-[#671FAB] cursor-pointer !h-[40px]"
            />
          </div>

          {calendarMode === 'timeGridDay' && (
            <InputDateButton
              value={selectedDate}
              onChange={handleDateChange}
              placeholder="เลือกวันที่"
              className="w-auto"
              formatDate="dd/MM/yyyy"
            />
          )}

          {calendarMode === 'dayGridMonth' && (
            <InputMonthPicker
              date={selectedDate}
              setDate={handleMonthChange}
              className="w-auto"
            />
          )}
        </div>
      </div>

      <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridDay"
                    nowIndicator={true}
                    allDaySlot={false}
                    themeSystem="standard"
                    headerToolbar={false}
                    height="495px"
                    dayCellDidMount={(info) => {
                      info.el.style.backgroundColor = 'white'
                    }}
                    slotLabelDidMount={(info) => {
                      info.el.style.fontFamily = 'IBM Plex Sans, sans-serif';
                    }}
                    eventDidMount={(info) => {
                      info.el.style.fontSize = '14px';
                      const bgColor = info.event.backgroundColor || (info.event.extendedProps.workType === "work" ? "#E1D2FF" : "#FDE5B6");
                      info.el.style.backgroundColor = bgColor;
                      info.el.style.borderColor = bgColor;
                      info.el.style.color = 'black';
                      info.el.style.fontWeight = 'normal';

                      if (screenSize === TABLET_SCREEN) {
                        info.el.style.fontSize = '12px';
                      }else if(screenSize === MOBILE_SCREEN){
                        info.el.style.fontSize = '5px';
                      }
                    }}
                    events={events}
                    slotLabelFormat={{
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    }}
                    eventTimeFormat={{
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    }}
                    eventClick={
                      screenSize === DESKTOP_SCREEN
                        ? handleEventMouseEnter
                        : (info) => {
                          if(calendarMode === 'dayGridMonth') {
                            //ถ้าเป็น mobile หรือ tablet ถ้าอยู่ใน mode เดือน เมื่อ click event แล้วให้แสดงเป็นรายวัน
                            handleMobileEventClick(info.event.start as Date)
                          }else {
                            //ถ้าเป็น mobile หรือ tablet ถ้าอยู่ใน mode วัน เมื่อ click event แล้วให้แสดง popup รายละเอียด
                            handleEventMouseEnter(info)
                          }
                        }
                    }
                    ref={calendarRef}
                    locale={th}
                    dayMaxEvents={2}
                    moreLinkContent={(args) => {
                      return { html: `<span class="lg:text-[14px] text-[7px]">อีก ${args.num} รายการ</span>` }
                    }}
                    moreLinkClick={
                      screenSize === DESKTOP_SCREEN
                        ? 'popover'
                        : (info) => handleMobileEventClick(info.date)
                    }
      />

      {showPopup && selectedEvent && popoverPosition && (
        <div
          ref={popupRef}
          className="fixed z-[9999] bg-white shadow-lg rounded-lg w-[80%] lg:w-[40%] xl:w-[30%] overflow-x-hidden max-h-[90%] border-1"
          style={{
            left: popoverPosition.x,
            top: popoverPosition.y
          }}
        >
          <EventDetailPopup
            event={selectedEvent}
            onClose={handleClosePopup}
          />
        </div>
      )}
    </Card>
  )
}

export default MyCalendar;

