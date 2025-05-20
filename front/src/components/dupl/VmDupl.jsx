import { useCallback } from "react"
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useSearch from "../../hooks/useSearch"; // ✅ 검색 기능 추가
import useGlobal from "../../hooks/useGlobal";
import SearchBox from "../button/SearchBox"; // ✅ 검색창 추가
import SelectedIdView from "../common/SelectedIdView";
import OVirtWebAdminHyperlink from "../common/OVirtWebAdminHyperlink";
import TablesOuter from "../table/TablesOuter";
import TableRowClick from "../table/TableRowClick";
import VmActionButtons from "./VmActionButtons";
import { 
  hostedEngineStatus2Icon,
  RVI16, rvi16Refresh,
  status2Icon
} from "../icons/RutilVmIcons";
import { getStatusSortKey } from "../icons/GetStatusSortkey";
import Localization from "../../utils/Localization";
import Logger from "../../utils/Logger";

/**
 * @name VmDupl
 * @description 가상 머신 목록을 표시하는 컴포넌트
 *
 * @param {Array} vms - 가상 머신 데이터 배열
 * @param {string[]} columns - 테이블 컬럼 정보
 * @returns {JSX.Element}
 */
const VmDupl = ({
  vms = [], columns = [], 
  refetch, isRefetching, isLoading, isError, isSuccess,
}) => {
  const navigate = useNavigate();
  const {
    vmsSelected, setVmsSelected
  } = useGlobal();

  const transformedData = [...vms].map((vm) => ({
    ...vm,
    icon: (
      <div className="f-center" style={{ gap: "4px" }}>
        {status2Icon(vm?.status)}
        {vm?.nextRun === true && status2Icon("NEXT_RUN")}
      </div>
    ),
    iconSortKey: getStatusSortKey(vm?.status), 
    engine: hostedEngineStatus2Icon(vm?.hostedEngineVm),
    _name: (
      <TableRowClick type="vm" id={vm?.id}>
        {vm?.name}
      </TableRowClick>
    ),
    host: (
      <TableRowClick type="host" id={vm?.hostVo?.id}>
        {vm?.hostVo?.name}
      </TableRowClick>
    ),
    cluster: (
      <TableRowClick type="cluster" id={vm?.clusterVo?.id}>
        {vm?.clusterVo?.name}
      </TableRowClick>
    ),
    dataCenter: (
      <TableRowClick type="datacenter" id={vm?.dataCenterVo?.id}>
        {vm?.dataCenterVo?.name}
      </TableRowClick>
    ),
    ipv4: vm?.ipv4 + " " + vm?.ipv6,
    memoryUsage:
      vm?.usageDto?.memoryPercent === null || vm?.usageDto?.memoryPercent === undefined
        ? ""
        : `${vm?.usageDto?.memoryPercent}%`,
    cpuUsage:
      vm?.usageDto?.cpuPercent === null || vm?.usageDto?.cpuPercent === undefined
        ? ""
        : `${vm?.usageDto?.cpuPercent}%`,
    networkUsage:
      vm.usageDto?.networkPercent !== null && vm.usageDto?.networkPercent !== undefined
        ? `${vm.usageDto.networkPercent}%`
        : vm.status === "UP"
        ? "0%"
        : "",      
    snapshotExist: vm?.snapshotVos?.length > 0 ? "O" : "X",
    // ✅ 검색 필드 추가 (한글 포함)
    searchText: `${vm?.name} ${vm?.hostVo?.name || ""} ${vm?.clusterVo?.name || ""} ${vm?.dataCenterVo?.name || ""} ${vm?.ipv4} ${vm?.ipv6}`.toLowerCase(),
  }));

  const { searchQuery, setSearchQuery, filteredData } = useSearch(transformedData);
  const handleNameClick = useCallback((id) => {
    navigate(`/computing/vms/${id}`);
  }, [navigate])
  const handleRefresh = useCallback(() => {
    Logger.debug(`VmDupl > handleRefresh ... `)
    if (!refetch) return;
    refetch()
    import.meta.env.DEV && toast.success("다시 조회 중 ...")
  }, [])

  return (
    <>{/* v-start w-full으로 묶어짐*/}
      <div className="dupl-header-group f-start gap-4 w-full">
        <SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} onRefresh={handleRefresh} />
        <VmActionButtons />
      </div>
      <TablesOuter target={"vm"}
        columns={columns}
        data={filteredData}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        multiSelect={true}
        onRowClick={(selectedRows) => setVmsSelected(selectedRows)}
        onClickableColumnClick={(row) => handleNameClick(row.id)}
        isLoading={isLoading} isRefetching={isRefetching} isError={isError} isSuccess={isSuccess}
      />
      <SelectedIdView items={vmsSelected} />
      <OVirtWebAdminHyperlink
        name={`${Localization.kr.COMPUTING}>${Localization.kr.VM}`}
        path="vms"
      />
    </>
  );
};

export default VmDupl;
