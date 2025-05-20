import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useUIState from "../../hooks/useUIState";
import useGlobal from "../../hooks/useGlobal";
import useSearch from "../../hooks/useSearch"; // ✅ 검색 기능 추가
import SelectedIdView from "../common/SelectedIdView";
import OVirtWebAdminHyperlink from "../common/OVirtWebAdminHyperlink";
import TemplateActionButtons from "./TemplateActionButtons";
import TablesOuter from "../table/TablesOuter";
import TableRowClick from "../table/TableRowClick";
import SearchBox from "../button/SearchBox"; // ✅ 검색창 추가
import Logger from "../../utils/Logger";
import Localization from "../../utils/Localization";

const TemplateDupl = ({
  templates = [],  columns = [],
  refetch, isRefetching, isLoading, isError, isSuccess,
}) => {
  const navigate = useNavigate();
  const { activeModal, setActiveModal } = useUIState()
  const {
    templatesSelected, setTemplatesSelected
  } = useGlobal();

  // ✅ 데이터 변환 (검색을 위한 `searchText` 필드 추가)
  const transformedData = [...templates].map((temp) => ({
    ...temp,
    _name: (
      <TableRowClick type="template" id={temp?.id}>
        {temp?.name}
      </TableRowClick>
    ),
    cluster: (
      <TableRowClick type="cluster" id={temp?.clusterVo?.id}>
        {temp?.clusterVo?.name}
      </TableRowClick>
    ),
    dataCenter: (
      <TableRowClick type="datacenter" id={temp?.dataCenterVo?.id}>
        {temp?.dataCenterVo?.name}
      </TableRowClick>
    ),
    searchText: `${temp?.name} ${temp?.clusterVo?.name || ""} ${temp?.dataCenterVo?.name || ""}`.toLowerCase(),
  }));

  // ✅ 검색 기능 적용
  const { searchQuery, setSearchQuery, filteredData } = useSearch(transformedData);

  const handleNameClick = useCallback((id) => {
    navigate(`/computing/templates/${id}`);
  }, [])

  const handleRefresh = useCallback(() =>  {
    Logger.debug(`TemplateDupl > handleRefresh ... `)
    if (!refetch) return;
    refetch()
    import.meta.env.DEV && toast.success("다시 조회 중 ...")
  }, [])

  return (
    <>{/* v-start w-full으로 묶어짐*/}
      <div className="dupl-header-group f-start gap-4 w-full">
        <SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} onRefresh={handleRefresh}/>
        <TemplateActionButtons />
      </div>
      <TablesOuter target={"template"}
        columns={columns}
        data={filteredData} // ✅ 검색 필터링된 데이터 사용
        searchQuery={searchQuery} // ✅ 검색어 전달
        setSearchQuery={setSearchQuery} // ✅ 검색어 변경 가능하도록 추가
        multiSelect={true}
        /*shouldHighlight1stCol={true}*/
        onRowClick={(selectedRows) => setTemplatesSelected(selectedRows)}
        onClickableColumnClick={(row) => handleNameClick(row.id)}
        isLoading={isLoading} isRefetching={isRefetching} isError={isError} isSuccess={isSuccess}
      />
      <SelectedIdView items={templatesSelected} />
      <OVirtWebAdminHyperlink
        name={`${Localization.kr.COMPUTING}>${Localization.kr.TEMPLATE}`}
        path="templates"
      />
    </>
  );
};

export default TemplateDupl;
