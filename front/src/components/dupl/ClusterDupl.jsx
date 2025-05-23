import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useGlobal from "../../hooks/useGlobal";
import useSearch from "../../hooks/useSearch";
import SelectedIdView from "../common/SelectedIdView";
import OVirtWebAdminHyperlink from "../common/OVirtWebAdminHyperlink";
import TablesOuter from "../table/TablesOuter";
import TableRowClick from "../table/TableRowClick";
import ClusterActionButtons from "./ClusterActionButtons";
import SearchBox from "../button/SearchBox";
import Localization from "../../utils/Localization";
import Logger from "../../utils/Logger";

/**
 * @name ClusterDupl
 * @description ...
 * 
 * @param {Array} clusters
 * @param {string[]} columns
 * @param {string} datacenterId
 * 
 * @returns
 */
const ClusterDupl = ({
  clusters = [], columns = [],
  refetch, isRefetching, isLoading, isError, isSuccess,
}) => {
  const navigate = useNavigate();
  const {
    clustersSelected, setClustersSelected
  } = useGlobal();

  const transformedData = [...clusters].map((cluster) => ({
    ...cluster,
    _name: (
      <TableRowClick type="cluster" id={cluster?.id}>
        {cluster?.name}
      </TableRowClick>
    ),
    hostCnt: cluster?.hostSize?.allCnt,
    vmCnt: cluster?.vmSize?.allCnt,
    dataCenter: (
      <TableRowClick type="datacenter" id={cluster?.dataCenterVo?.id}>
        {cluster?.dataCenterVo?.name}
      </TableRowClick>
    ),
    searchText: `${cluster?.name} ${cluster?.dataCenterVo?.name || ""}`.toLowerCase(),
  }));

  // ✅ 검색 기능 적용
  const { searchQuery, setSearchQuery, filteredData } = useSearch(transformedData);

  const handleNameClick = useCallback((id) => {
    navigate(`/computing/clusters/${id}`);
  }, [navigate])
  
  const handleRefresh = useCallback(() =>  {
    Logger.debug(`ClusterDupl > handleRefresh ... `)
    if (!refetch) return;
    refetch()
    import.meta.env.DEV && toast.success("다시 조회 중 ...")
  }, [])

  return (
    <>{/* v-start w-full으로 묶어짐*/}
      <div className="dupl-header-group f-start gap-4 w-full">
        <SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} onRefresh={handleRefresh} />
        <ClusterActionButtons />
      </div>
      <TablesOuter target={"cluster"}
        columns={columns}
        data={filteredData}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
        multiSelect={true}
        onRowClick={(selectedRows) => setClustersSelected(selectedRows)}
        onClickableColumnClick={(row) => handleNameClick(row.id)}
        isLoading={isLoading} isRefetching={isRefetching} isError={isError} isSuccess={isSuccess}
      />
      <SelectedIdView items={clustersSelected} />
      <OVirtWebAdminHyperlink name={`${Localization.kr.COMPUTING}>${Localization.kr.CLUSTER}`} path="clusters" />
    </>
  );
};

export default ClusterDupl;
