import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useGlobal from "../../hooks/useGlobal";
import useSearch from "../../hooks/useSearch"; // ✅ 검색 기능 추가;
import SelectedIdView from "../common/SelectedIdView";
import OVirtWebAdminHyperlink from "../common/OVirtWebAdminHyperlink";
import DomainActionButtons from "./DomainActionButtons";
import TablesOuter from "../table/TablesOuter";
import SearchBox from "../button/SearchBox"; // ✅ 검색 UI 추가
import DomainDataCenterActionButtons from "./DomainDataCenterActionButtons";
import { checkZeroSizeToGiB, convertBytesToGB } from "../../util";
import TableRowClick from "../table/TableRowClick";
import { hostedEngineStatus2Icon, status2Icon } from "../icons/RutilVmIcons";
import { getStatusSortKey } from "../icons/GetStatusSortkey";
import Localization from "../../utils/Localization";
import Logger from "../../utils/Logger";

/**
 * @name DomainDupl
 * @description 도메인 목록을 표시하는 컴포넌트 (검색 및 테이블 포함)
 * 
 * @param {Array} domains,
 * @param {Boolean} actionType datacenter-domain, domain-datacenter 버튼활성화,
 * @returns {JSX.Element}
 */
const DomainDupl = ({
  domains = [], columns = [],
  actionType, sourceContext = "all", 
  refetch, isRefetching, isLoading, isError, isSuccess,
}) => {
  // sourceContext: all = 전체목록 fromDomain = 도메인에서 데이터센터 fromDatacenter = 데이터센터에서 도메인
  const navigate = useNavigate();
  const { domainsSelected, setDomainsSelected } = useGlobal()
  
  // ✅ 데이터 변환 (검색을 위한 `searchText` 필드 추가)
  const transformedData = [...domains].map((domain) => ({
    ...domain,
    _name: (
      <TableRowClick type="domain" id={domain?.id}>
        {domain?.name}
      </TableRowClick>
    ),
    icon: status2Icon(domain.status),
    iconSortKey: getStatusSortKey(domain?.status), 
    _status: Localization.kr.renderStatus(domain?.status),
    hostedEngine: hostedEngineStatus2Icon(domain?.hostedEngine),
    domainType:
      domain?.type === "data"
        ? `데이터 ${domain?.master === true ? "(마스터)": ""}`
        : domain?.type === "iso"
          ? `ISO ${domain?.master === true ? "(마스터)": ""}`
          : `EXPORT ${domain?.master === true ? "(마스터)": ""}`,
    storageType:
      domain?.storageVo?.type === "NFS"
        ? "NFS"
        : domain?.storageVo?.type === "ISCSI"
            ? "iSCSI"
            : "Fibre Channel",
    format: domain?.storageFormat,
    size: checkZeroSizeToGiB(domain?.size),
    availableSize: checkZeroSizeToGiB(domain?.availableSize),
    usedSize: checkZeroSizeToGiB(domain?.usedSize),
    searchText: `${domain?.name} ${domain?.domainType} ${domain?.storageType} ${convertBytesToGB(domain?.diskSize)}GB`
  }));

  // ✅ 검색 기능 적용
  const { searchQuery, setSearchQuery, filteredData } = useSearch(transformedData);
  const handleRefresh = useCallback(() =>  {
    Logger.debug(`DomainDupl > handleRefresh ... `)
    if (!refetch) return;
    refetch()
    import.meta.env.DEV && toast.success("다시 조회 중 ...")
  }, [])

  const handleNameClick = useCallback((id) => {
    navigate(`/storages/domains/${id}`);
  }, [navigate])

  return (
    <>{/* v-start w-full으로 묶어짐*/}
      <div className="dupl-header-group f-start gap-4 w-full">
        <SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} onRefresh={handleRefresh} />
        {sourceContext === "all" 
          ? <DomainActionButtons actionType={actionType} />
          : <DomainDataCenterActionButtons actionType={actionType} />
        }
      </div>
      <TablesOuter target={"domain"}
        columns={columns}
        data={filteredData} // ✅ 검색 필터링된 데이터 전달
        multiSelect={true}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
        onRowClick={(selectedRows) => setDomainsSelected(selectedRows)}
        onClickableColumnClick={(row) => handleNameClick(row.id)}
        isLoading={isLoading} isRefetching={isRefetching} isError={isError} isSuccess={isSuccess}
      />
      <SelectedIdView items={domainsSelected} />
      <OVirtWebAdminHyperlink name={`${Localization.kr.COMPUTING}>${Localization.kr.DOMAIN}`} path="storage" />
    </>
  );
};

export default DomainDupl;
