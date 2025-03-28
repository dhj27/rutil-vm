import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TemplateActionButtons from "./TemplateActionButtons";
import TemplateModals from "../modal/template/TemplateModals";
import TablesOuter from "../table/TablesOuter";
import TableRowClick from "../table/TableRowClick";
import SearchBox from "../button/SearchBox"; // ✅ 검색창 추가
import useSearch from "../button/useSearch"; // ✅ 검색 기능 추가

const TemplateDupl = ({
  isLoading, isError, isSuccess,
  templates = [], columns = [], type,
  showSearchBox = true,  // ✅ 검색 여부 추가
}) => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [selectedTemplates, setSelectedTemplates] = useState([]);

  // ✅ 데이터 변환 (검색을 위한 `searchText` 필드 추가)
  const transformedData = templates.map((temp) => ({
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

  const selectedIds = selectedTemplates.map((template) => template.id).join(", ");
  const handleNameClick = (id) => navigate(`/computing/templates/${id}`);

  // 모달 열기 / 닫기
  const openModal = (action) => setActiveModal(action);
  const closeModal = () => setActiveModal(null);

  return (
    <>
      <div className="dupl-header-group">
        {showSearchBox && (
          <SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        )}
        <TemplateActionButtons
          openModal={openModal}
          isEditDisabled={selectedTemplates.length !== 1}
          isDeleteDisabled={selectedTemplates.length === 0}
        />
      </div>

      {/* 테이블 컴포넌트 */}
      <TablesOuter
        isLoading={isLoading}
        isError={isError}
        isSuccess={isSuccess}
        columns={columns}
        data={filteredData} // ✅ 검색 필터링된 데이터 사용
        shouldHighlight1stCol={true}
        onRowClick={(selectedRows) => setSelectedTemplates(selectedRows)}
        // clickableColumnIndex={[0]}
        searchQuery={searchQuery} // ✅ 검색어 전달
        setSearchQuery={setSearchQuery} // ✅ 검색어 변경 가능하도록 추가
        onClickableColumnClick={(row) => handleNameClick(row.id)}
        multiSelect={true}
        onContextMenuItems={(row) => [
          <TemplateActionButtons
            openModal={openModal}
            status={row?.status}
            selectedTemplates={[row]}
            actionType="context"
          />,
        ]}
      />

      {/* 템플릿 모달창 */}
      <TemplateModals
        activeModal={activeModal}
        template={selectedTemplates[0]}
        selectedTemplates={selectedTemplates}
        onClose={closeModal}
      />
    </>
  );
};

export default TemplateDupl;
