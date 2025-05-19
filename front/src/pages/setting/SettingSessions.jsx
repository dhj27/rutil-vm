import React, { useCallback } from "react";
import toast from "react-hot-toast";
import useGlobal from "../../hooks/useGlobal";
import useSearch from "../../hooks/useSearch";
import SearchBox from "../../components/button/SearchBox"; // ✅ 검색창 추가
import SelectedIdView from "../../components/common/SelectedIdView";
import OVirtWebAdminHyperlink from "../../components/common/OVirtWebAdminHyperlink";
import TablesOuter from "../../components/table/TablesOuter";
import TableColumnsInfo from "../../components/table/TableColumnsInfo";
import SettingUserSessionsActionButtons from "./SettingUserSessionsActionButtons";
import { useAllUserSessions } from "../../api/RQHook";
import Localization from "../../utils/Localization";
import Logger from "../../utils/Logger";

/**
 * @name SettingSessions
 * @description 관리 > 활성 사용자 세션
 *
 * @returns {JSX.Element} SettingSessions
 */
const SettingSessions = () => {
  const {
    usersessionsSelected, setUsersessionsSelected
  } = useGlobal()

  const {
    data: userSessions = [],
    isLoading: isUserSessionsLoading,
    isError: isUserSessionsError,
    isSuccess: isUserSessionsSuccess,
    refetch: refetchUserSessios
  } = useAllUserSessions("");

  const transformedData = [...userSessions]?.map((session) => ({
    ...session
  }))

  const { searchQuery, setSearchQuery, filteredData } = useSearch(transformedData);
  const handleRefresh = useCallback(() => {
    Logger.debug(`VmDupl > handleRefresh ... `)
    if (!refetchUserSessios) return;
    refetchUserSessios()
    import.meta.env.DEV && toast.success("다시 조회 중 ...")
  }, [])

  return (
    <>{/* v-start w-full으로 묶어짐*/}
      <div className="dupl-header-group f-start gap-4 w-full">
        <SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} onRefresh={handleRefresh} />
        <SettingUserSessionsActionButtons />
      </div>
      <TablesOuter target={"usersession"}
        columns={TableColumnsInfo.ACTIVE_USER_SESSION}
        data={filteredData}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRowClick={(row) => setUsersessionsSelected(row)}
        /*onClickableColumnClick={(row) => handleNameClick(row.id)}*/
        isLoading={isUserSessionsLoading} isError={isUserSessionsError} isSuccess={isUserSessionsSuccess}
      />
      <SelectedIdView items={usersessionsSelected} />
      <OVirtWebAdminHyperlink
        name={`${Localization.kr.MANAGEMENT}>${Localization.kr.USER_SESSION}`}
        path={`sessions`}
      />
    </>
  );
};

export default SettingSessions;
