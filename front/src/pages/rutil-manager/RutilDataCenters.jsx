import React, { useEffect } from "react";
import useGlobal from "../../hooks/useGlobal";
import TableColumnsInfo from "../../components/table/TableColumnsInfo";
import DataCenterDupl from "../../components/dupl/DataCenterDupl";
import { useAllDataCenters } from "../../api/RQHook";
import Logger from "../../utils/Logger";

/**
 * @name RutilDataCenters
 * @description 데이터센터 전체
 * 경로: <메뉴>/rutil-manager/datacenters
 * 
 * @returns {JSX.Element} DataCenters
 */
const RutilDataCenters = () => {
  const { setDatacentersSelected } = useGlobal()

  const {
    data: datacenters = [],
    isLoading: isDataCentersLoading,
    isError: isDataCentersError,
    isSuccess: isDataCentersSuccess,
    refetch: refetchDataCenters,
  } = useAllDataCenters((e) => ({ ...e }));

  useEffect(() => {
    return () => {
      Logger.debug("RutilDataCenters > useEffect ... CLEANING UP");
      setDatacentersSelected([])
    }
  }, []);
  
  return (
    <DataCenterDupl columns={TableColumnsInfo.DATACENTERS}
      datacenters={datacenters}
      refetch={refetchDataCenters}
      isLoading={isDataCentersLoading} isError={isDataCentersError} isSuccess={isDataCentersSuccess}
    />
  );
};

export default RutilDataCenters;
