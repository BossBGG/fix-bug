"use client";

import { NotificationList, NotificationObj } from "@/app/api/NotificationApi";
import InputDateRange from "@/app/components/form/InputDateRange";
import InputSearch from "@/app/components/form/InputSearch";
import InputSelect from "@/app/components/form/InputSelect";
import { DataTable } from "@/app/components/list/DataTable";
import FilterDialog from "@/app/components/list/FilterDialog";
import LatestUpdateData from "@/app/components/utils/LatestUpdateData";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import { showConfirm } from "@/app/helpers/Alert";
import { formatJSDate } from "@/app/helpers/DatetimeHelper";
import ModalFilter from "@/app/layout/ModalFilter";
import { useAppSelector, useAppDispatch } from "@/app/redux/hook";
import { Options } from "@/types";
import {
  faEnvelope,
  faTrashCan,
  faBell,
  faExclamationTriangle,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addMonths, subMonths } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { getColumns } from "./columns";
import EmptyData from "./empty-data";
import ListData from "@/app/components/list/ListData";
import ListDataContent from "./list-data-content";
import { SyncFailedPopup } from "@/components/ui/popup";
import NotificationBreadcrumb from "./breadcrumb";
import {
  markMultipleAsRead,
  bulkDelete,
} from "@/app/redux/slices/notificationSlice";
// import { SortControls } from "./sort-controls";
// import type { NotificationSortField, SortOrder } from "@/types/notification";
import {
  DESKTOP_SCREEN,
  MOBILE_SCREEN,
} from "@/app/redux/slices/ScreenSizeSlice";
import { useWebPushNotification } from "@/hooks/useWebPushNotification";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import Link from "next/link";
import { CustomTooltip } from "@/components/ui/custom-tooltip";

const Notification = () => {
  const { setBreadcrumb } = useBreadcrumb();
  const dispatch = useAppDispatch();
  const screenSize = useAppSelector((state) => state.screen_size);
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.user);
  const viewMode = user.type === 'VENDOR_USER' ? 'SELF' : 'ALL';
  const [data, setData] = useState<NotificationObj[]>([]);
  const [search, setSearch] = useState<string>("");
  const [search_filter, setSearchFilter] = useState<string>("");
  const [type_filter, setTypeFilter] = useState<string | number>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showSyncFailedPopup, setShowSyncFailedPopup] = useState(false);
  // const [sortBy, setSortBy] = useState<NotificationSortField>("sentAt");
  // const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [maxDevices, setMaxDevices] = useState(5);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const webPush = useWebPushNotification(() => {
    // Refresh notification list when new notification received
    setRefreshTrigger((prev) => prev + 1);
  });
  const { permission, requestPermission } = useNotificationPermission();

  const userId = token
    ? (() => {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          return payload.sub;
        } catch {
          return undefined;
        }
      })()
    : undefined;

  const isSubscribed =
    typeof window !== "undefined" &&
    localStorage.getItem("webpush_subscribed") === "true";
  const showEnableBanner = !dismissedBanner && permission === "default";
  const showDeniedBanner = !dismissedBanner && permission === "denied";

  const initDate: DateRange = {
    from: subMonths(new Date(), 1),
    to: addMonths(new Date(), 1),
  };

  const [date, setDate] = useState<DateRange | undefined>(initDate);

  const initFilterDate = {
    from: formatJSDate(initDate.from as Date, "yyyy-MM-dd"),
    to: formatJSDate(initDate.to as Date, "yyyy-MM-dd"),
  };

  const [filters, setFilters] = useState({
    dateFrom: initFilterDate.from,
    dateTo: initFilterDate.to,
    type: "all",
  });

  useEffect(() => {
    setBreadcrumb(<NotificationBreadcrumb />);
    loadConfig();
  }, [setBreadcrumb]);

  const loadConfig = async () => {
    try {
      const { pushNotificationApi } = await import(
        "@/services/api/pushNotification.api"
      );
      const data = await pushNotificationApi.getConfig();
      setMaxDevices(data.maxDevices);
    } catch (error) {
      console.error("Failed to load config:", error);
    }
  };

  const clearFilter = () => {
    setSearch("");
    setSearchFilter("");
    setTypeFilter("all");
    setDate(initDate);
    setFilters({
      dateFrom: initFilterDate.from,
      dateTo: initFilterDate.to,
      type: "all",
    });
  };

  const submitSearch = () => {
    const filter_item = {
      dateFrom: date?.from ? formatJSDate(date.from, "yyyy-MM-dd") : "",
      dateTo: date?.to ? formatJSDate(date.to, "yyyy-MM-dd") : "",
      type: type_filter as string,
    };
    setFilters(filter_item);
  };

  const tableApiData = useMemo(() => {
    const items: {
      dateFrom: string;
      dateTo: string;
      search: string;
      type?: string;
      view: 'ALL' | 'SELF';
    } = {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      search: search_filter,
      view: viewMode,
    };

    if (type_filter !== "all") {
      items.type = type_filter as string;
    }

    return items;
  }, [filters, search_filter, type_filter, refreshTrigger, viewMode]);

  const typeOptions: Options[] = [
    { value: "all", label: "ทั้งหมด" },
    { value: "SURVEY_NEW", label: "แบบสำรวจใหม่" },
    { value: "SURVEY_SUCCESS", label: "สำรวจงานสำเร็จ" },
    { value: "SURVEY_FAILED", label: "สำรวจไม่สำเร็จ" },
    { value: "SURVEY_CANCELLED", label: "ยกเลิกแบบสำรวจ" },
    { value: "WORKORDER_NEW", label: "ใบสั่งงานใหม่" },
    { value: "WORKORDER_RECORDED", label: "บันทึกใบสั่งงาน" },
    { value: "WORKORDER_COMPLETED", label: "เสร็จสิ้นใบสั่งงาน" },
    { value: "WORKORDER_APPROVED", label: "อนุมัติใบสั่งงาน" },
    { value: "WORKORDER_REJECTED", label: "ปฏิเสธใบสั่งงาน" },
    { value: "WORKORDER_CANCELLED", label: "ยกเลิกใบสั่งงาน" },
  ];

  const handleCheckNotification = (checked: boolean, id: string) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    const isConfirm = await showConfirm("คุณต้องการลบรายการที่เลือกหรือไม่?");
    if (isConfirm) {
      await dispatch(bulkDelete(selectedIds));
      setSelectedIds([]);
      // Refresh data after delete
      window.location.reload();
    }
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedIds.length === 0) return;
    await dispatch(markMultipleAsRead(selectedIds));
    setSelectedIds([]);
  };

  const handleSyncRetry = () => {
    setShowSyncFailedPopup(true);
  };

  const handleEnableNotification = async () => {
    if (!userId) return;

    const result = await requestPermission();

    if (result === "granted") {
      try {
        const deviceId =
          localStorage.getItem("device_id") || crypto.randomUUID();
        localStorage.setItem("device_id", deviceId);

        const token = await webPush.subscribe(
          userId,
          deviceId,
          navigator.userAgent
        );

        if (token) {
          localStorage.setItem("webpush_subscribed", "true");
          setDismissedBanner(true);
          await showConfirm("เปิดการแจ้งเตือนสำเร็จ");
        } else if (webPush.error === "DEVICE_LIMIT_REACHED") {
          await showConfirm(
            `คุณมีอุปกรณ์เชื่อมต่อครบจำนวนแล้ว (สูงสุด ${maxDevices} เครื่อง)\n` +
              "กรุณาลบอุปกรณ์เก่าในหน้าตั้งค่าก่อนเพิ่มอุปกรณ์ใหม่"
          );
        } else {
          await showConfirm(
            "ไม่สามารถเปิดการแจ้งเตือนได้ กรุณาลองใหม่อีกครั้ง"
          );
        }
      } catch (error) {
        await showConfirm("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    }
  };

  return (
    <div>
      <LatestUpdateData showConnectInfo={true} />

      {/* Enable Notification Banner */}
      {showEnableBanner && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <FontAwesomeIcon
                icon={faBell}
                className="text-blue-600 text-xl"
              />
              <div>
                <p className="font-medium text-blue-900">
                  เปิดการแจ้งเตือนเพื่อไม่พลาดอัพเดทสำคัญ
                </p>
                <p className="text-sm text-blue-700">
                  รับการแจ้งเตือนแบบ real-time เมื่อมีใบสั่งงานใหม่
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDismissedBanner(true)}
                className="px-4 py-2 text-blue-700 hover:bg-blue-100 rounded-lg"
              >
                ภายหลัง
              </button>
              <button
                onClick={handleEnableNotification}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
              >
                เปิดใช้งาน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Denied Banner */}
      {showDeniedBanner && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-yellow-600 text-xl"
              />
              <div>
                <p className="font-medium text-yellow-900">
                  การแจ้งเตือนถูกปิดใช้งาน
                </p>
                <p className="text-sm text-yellow-700">
                  กรุณาเปิดการแจ้งเตือนในการตั้งค่าเบราว์เซอร์ หรือ{" "}
                  <Link
                    href="/settings/notifications"
                    className="underline font-medium"
                  >
                    จัดการในหน้าตั้งค่า
                  </Link>
                </p>
              </div>
            </div>
            <button
              onClick={() => setDismissedBanner(true)}
              className="px-4 py-2 text-yellow-700 hover:bg-yellow-100 rounded-lg"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      <div className="border-1 border-[#E1D2FF] rounded-[20px] p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1  min-w-[200px] ">
            {screenSize !== MOBILE_SCREEN && (
              <div className="flex w-full items-center justify-between mb-3 gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <CustomTooltip 
                    fieldValue={search_filter}
                    fieldLabel="ค้นหา"
                  >
                    <InputSearch
                      handleSearch={setSearchFilter}
                      placeholder="ค้นหา"
                    />
                  </CustomTooltip>
                  {/* <SortControls
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={(newSortBy, newSortOrder) => {
                      setSortBy(newSortBy);
                      setSortOrder(newSortOrder);
                    }}
                  /> */}

                  <FilterDialog>
                    <ModalFilter
                      title={"ตัวกรอง"}
                      clearFilter={clearFilter}
                      submitSearch={() => submitSearch()}
                    >
                      <CustomTooltip 
                        fieldValue={date?.from && date?.to ? `${date.from.toLocaleDateString('th-TH')} - ${date.to.toLocaleDateString('th-TH')}` : ''}
                        fieldLabel="วันที่"
                      >
                        <InputDateRange
                          setData={setDate}
                          data={date}
                          label="วันที่"
                        />
                      </CustomTooltip>

                      <CustomTooltip 
                        fieldValue={typeOptions.find(opt => opt.value === type_filter)?.label}
                        fieldLabel="ประเภท"
                      >
                        <InputSelect
                          label="ประเภท"
                          placeholder="ทั้งหมด"
                          options={typeOptions}
                          setData={setTypeFilter}
                          value={type_filter as string}
                        />
                      </CustomTooltip>
                    </ModalFilter>
                  </FilterDialog>
                </div>

                <div className="flex gap-2">
                  <Link
                    href="/settings/notifications"
                    aria-label="ตั้งค่าการแจ้งเตือน"
                    className="bg-[#E1D2FF] rounded-full px-4 py-4 flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faCog} color="#671FAB" />
                  </Link>
                  <button
                    onClick={handleMarkSelectedAsRead}
                    disabled={selectedIds.length === 0}
                    className="bg-[#F0E9F7] disabled:opacity-50 disabled:cursor-not-allowed rounded-full px-4 py-4 flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faEnvelope} color="#671FAB" />
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.length === 0}
                    className="bg-[#FFD4D4] disabled:opacity-50 disabled:cursor-not-allowed rounded-full px-4 py-4 flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faTrashCan} color="#E02424" />
                  </button>
                </div>
              </div>
            )}

            {screenSize === MOBILE_SCREEN && (
              <div className="mb-3">
                <div className="flex justify-end gap-2 mb-3">
                  <Link
                    href="/settings/notifications"
                    aria-label="ตั้งค่าการแจ้งเตือน"
                    className="bg-[#E1D2FF] disabled:opacity-50 disabled:cursor-not-allowed rounded-full w-[48px] h-[48px] flex items-center justify-center"
                  >
                    <FontAwesomeIcon
                      icon={faCog}
                      color="#671FAB"
                      size="lg"
                    />
                  </Link>
                  <button
                    onClick={handleMarkSelectedAsRead}
                    disabled={selectedIds.length === 0}
                    className="bg-[#F0E9F7] disabled:opacity-50 disabled:cursor-not-allowed rounded-full w-[48px] h-[48px] flex items-center justify-center"
                  >
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      color="#671FAB"
                      size="lg"
                    />
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.length === 0}
                    className="bg-[#FFD4D4] disabled:opacity-50 disabled:cursor-not-allowed rounded-full w-[48px] h-[48px] flex items-center justify-center"
                  >
                    <FontAwesomeIcon
                      icon={faTrashCan}
                      color="#E02424"
                      size="lg"
                    />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <InputSearch
                      handleSearch={setSearchFilter}
                      placeholder="ค้นหา"
                    />
                  </div>

                  <FilterDialog>
                    <ModalFilter
                      title={"ตัวกรอง"}
                      clearFilter={clearFilter}
                      submitSearch={() => submitSearch()}
                    >
                      <InputDateRange
                        setData={setDate}
                        data={date}
                        label="วันที่"
                      />

                      <InputSelect
                        label="ประเภท"
                        placeholder="ทั้งหมด"
                        options={typeOptions}
                        setData={setTypeFilter}
                        value={type_filter as string}
                      />
                    </ModalFilter>
                  </FilterDialog>
                </div>
              </div>
            )}
          </div>
        </div>

        {screenSize === DESKTOP_SCREEN ? (
          <DataTable
            columns={getColumns(
              (checked, id) => handleCheckNotification(checked, id),
              selectedIds
            )}
            tableApi={NotificationList}
            tableApiData={tableApiData}
            emptyData={<EmptyData />}
          />
        ) : (
          <div>
            <ListData
              setListData={(data) => setData(data as NotificationObj[])}
              tableApi={NotificationList}
              tableApiData={tableApiData}
              visibleSizeSelection={true}
            >
              {data?.length > 0 ? (
                data.map((item, index) => (
                  <ListDataContent
                    item={item}
                    key={index}
                    onCheck={handleCheckNotification}
                  />
                ))
              ) : (
                <EmptyData />
              )}
            </ListData>
          </div>
        )}
      </div>
      <SyncFailedPopup
        open={showSyncFailedPopup}
        onClose={() => setShowSyncFailedPopup(false)}
        onConfirm={() => {
          setShowSyncFailedPopup(false);
        }}
      />
    </div>
  );
};

export default Notification;
