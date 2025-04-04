import React, { useState, useEffect, useRef, Suspense } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDesktop } from "@fortawesome/free-solid-svg-icons";
import { useHost, useNetworkFromCluster, useNetworkInterfacesFromHost } from "../../../api/RQHook";
import { checkZeroSizeToMbps } from "../../../util";
import { RVI16, rvi16TriangleUp, rvi16VirtualMachine, RVI24, rvi24CompareArrows, RVI36, rvi36Edit, status2Icon } from "../../../components/icons/RutilVmIcons";
import Loading from "../../../components/common/Loading";
import HostNetworkEditModal from "../../../components/modal/host/HostNetworkEditModal";
import HostNetworkBondingModal from "../../../components/modal/host/HostNetworkBondingModal";
import LabelCheckbox from "../../../components/label/LabelCheckbox";
import Logger from "../../../utils/Logger";


const HostNics = ({ hostId }) => {
  const { data: host } = useHost(hostId);
  
  const { data: hostNics = [] } = useNetworkInterfacesFromHost(hostId, (e) => ({ ...e }));
  const { data: networks = [] } = useNetworkFromCluster(host?.clusterVo?.id, (e) => ({ ...e }));  // 할당되지 않은 논리 네트워크 조회

  Logger.debug(`hostNics: ${JSON.stringify(hostNics, null, 2)}`);

  const transformedData = hostNics.map((e) => ({
    ...e,
    id: e?.id,
    name: e?.name,
    bondingVo: {
      activeSlave: {
        id: e?.bondingVo?.activeSlave?.id, 
        name: e?.bondingVo?.activeSlave?.name
      },
      slaves: e?.bondingVo?.slaves?.map((slave) => ({
        id: slave.id,
        name: slave.name,
      })),
    },
    bridged: e?.bridged,
    ipv4BootProtocol: e?.bootProtocol,
    ipv4Address: e?.ip?.address,
    ipv4Gateway: e?.ip?.gateway,
    ipv4Netmask: e?.ip?.netmask,
    ipv6BootProtocol: e?.ipv6BootProtocol,
    ipv6Address: e?.ipv6?.address,
    ipv6Gateway: e?.ipv6?.gateway,
    ipv6Netmask: e?.ipv6?.netmask,
    macAddress: e?.macAddress,
    mtu: e?.mtu,
    status: e?.status,
    network: {id: e?.networkVo?.id, name: e?.networkVo?.name},
    speed: checkZeroSizeToMbps(e?.speed),
    rxSpeed: checkZeroSizeToMbps(e?.rxSpeed),
    txSpeed: checkZeroSizeToMbps(e?.txSpeed),
    rxTotalSpeed: e?.rxTotalSpeed?.toLocaleString() || "0",
    txTotalSpeed: e?.txTotalSpeed?.toLocaleString() || "0",
    pkts: `${e?.rxTotalError} Pkts` || "1 Pkts",
  }));
  
  const transNetworkData = networks.map((e) => ({
    id: e?.id,
    name: e?.name,
    status: e?.status,
    vlan: e?.vlan,
    usageVm: e?.usage?.vm, 
  }));

  useEffect(() => {
    Logger.debug(`NIC 데이터 확인 ... ${transformedData}`);
  }, [transformedData]);

  // 네트워크 인터페이스 및 Bonding 정보를 저장하는 배열
  const [outer, setOuter] = useState([]);
  
  const [selectedBonding, setSelectedBonding] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);

  // const [contextMenu, setContextMenu] = useState(null);
  const [isBondingPopupOpen, setIsBondingPopupOpen] = useState(false);
  const [isNetworkEditPopupOpen, setIsNetworkEditPopupOpen] = useState(false);
  
  // 본딩 모달 열기
  const openBondingPopup = (bond) => {
    setSelectedBonding(bond); // 선택한 본딩 정보 저장
    setIsBondingPopupOpen(true);
  }; 
  
  // 네트워크 편집 모달 열기
  const openNetworkEditPopup = (network) => {
    setSelectedNetwork(network); // 선택한 네트워크 정보 저장
    setIsNetworkEditPopupOpen(true);
  };

  useEffect(() => {
    if (hostNics) {
      setOuter(hostNics.map((nic) => ({
        id: nic.id,
        name: nic.bondingVo?.slaves?.length > 1 ? nic?.name : "",
        children: nic.bondingVo?.slaves?.length > 0 ? nic.bondingVo.slaves : [{ id: nic.id, name: nic.name }],
        networks: nic.networkVo?.id ? [{ id: nic.networkVo.id, name: nic.networkVo.name }] : [],
      })));
    }
  }, [hostNics]);

  const assignedNetworkIds = outer.flatMap((outerItem) =>outerItem.networks.map((net) => net.id));
  const availableNetworks = networks?.filter((net) => !assignedNetworkIds.includes(net.id));
  
  // 드래그하는 요소를 추적
  const dragItem = useRef(null);  

  // 드래그 시작할 때 선택된 아이템과 출처 저장.
  const dragStart = (e, item, source, parentId = null) => { dragItem.current = { item, source, parentId } };

  // 드롭된 대상에 따라 네트워크 할당, 본딩 생성 등의 처리
  const drop = (targetId, targetType) => {
    if (!dragItem.current) return;
    const { item, source, parentId } = dragItem.current;
  
    if (source === "container" && targetType === "interface") {
      if (parentId === targetId) {
        alert("같은 Interface 내에서는 이동할 수 없습니다.");
        dragItem.current = null;
        return;
      }
  
      setOuter((prevOuter) => {
        let validMove = true;
        let bondRequired = false; // Bonding이 필요한 경우 플래그
  
        const updatedOuter = prevOuter.map((outerItem) => {
          if (outerItem.id === parentId) {
            if ( outerItem.networks.length > 0 && outerItem.children.length === 1 ) {
              alert("Container를 이동할 수 없습니다. 연결된 네트워크가 있고 container가 하나뿐입니다.");
              validMove = false;
              return outerItem;
            }
            return {
              ...outerItem,
              children: outerItem.children.filter((child) => child.id !== item.id),
            };
          }
  
          if (outerItem.id === targetId) {
            const targetHasBond = outerItem.name.startsWith("bond");
            const targetHasMultipleChildren = outerItem.children.length > 1;
            const targetHasNetwork = outerItem.networks.length > 0;
          
            const sourceOuter = prevOuter.find((oi) => oi.id === parentId);
            const sourceHasNetwork = sourceOuter?.networks?.length > 0;
          
            if (targetHasBond && targetHasMultipleChildren) {
              return {
                ...outerItem,
                children: [...outerItem.children, item],
              };
            } else if (targetHasBond && !targetHasMultipleChildren && targetHasNetwork) {
              alert("Container를 이동할 수 없습니다. 연결된 네트워크가 있고 container가 하나뿐입니다.");
              validMove = false;
              return outerItem;
            } else {
              // ✅ 여기 조건 추가
              if (sourceHasNetwork || targetHasNetwork) {
                bondRequired = true;
              }
            }
          
            return {
              ...outerItem,
              children: [...outerItem.children, item],
            };
          }
          
          
          return outerItem;
        });
  
        if (bondRequired) {
          openBondingPopup("create"); // Bonding 모달 띄우기
        }
  
        return validMove ? updatedOuter : prevOuter;
      });
    } else if (source === "unassigned" && targetType === "networkOuter") {
      // 네트워크를 인터페이스에 추가
      setOuter((prevOuter) =>
        prevOuter.map((outerItem) => {
          if (outerItem.id === targetId) {
            if (outerItem.networks.length > 0) {
              alert("1개의 네트워크만 걸 수 있습니다.");
              return outerItem;
            }
            return { ...outerItem, networks: [...outerItem.networks, item] };
          }
          return outerItem;
        })
      );
      
    } else if (source === "networkOuter" && targetType === "unassigned") {
      // 네트워크를 할당 해제 (Unassigned로 이동)
      setOuter((prevOuter) => prevOuter.map((outerItem) => {
        if (outerItem.id === parentId) {
          return {
            ...outerItem,
            networks: outerItem.networks.filter((network) => network.id !== item.id),
          };
        }
        return outerItem;
      }).filter(
        (outerItem) => outerItem.children.length > 0 || outerItem.networks.length > 0) // Remove empty outer
      );
      
    } else if (source === "networkOuter" && targetType === "networkOuter") {
      // 네트워크를 다른 인터페이스로 이동
      setOuter((prevOuter) => prevOuter.map((outerItem) => {
        if (outerItem.id === parentId) {
          return {
            ...outerItem,
            networks: outerItem.networks.filter( (network) => network.id !== item.id ),
          };
        }
        if (outerItem.id === targetId) {
          if (outerItem.networks.length > 0) {
            alert("1개의 네트워크만 걸 수 있습니다.");
            return outerItem;
          }
          return {
            ...outerItem,
            networks: [...outerItem.networks, item],
          };
        }
      return outerItem;
      }));
    }
    dragItem.current = null; // Reset drag state
  };


  return (
    <>
      <div className="py-3 font-bold underline"></div>
      <div className="host-network-separation f-btw">
        <div className="network-separation-left">
          <div className ="f-btw">
            <div>인터페이스</div>
            <div>할당된 논리 네트워크</div>
          </div>

          {outer
            .filter(outerItem => outerItem.children.length > 0 || outerItem.networks.length > 0)
            .map((outerItem) => (
              <div key={outerItem.id} className="separation-left-content">

                {/* ✅ 단일 container일 경우 .interface 제거하고 width: 39% 적용 */}
                {outerItem.children.length === 1 ? (
                  <div
                    className="single-container-wrapper"
                    style={{ width: "39%", margin: "0" }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => drop(outerItem.id, "interface")}
                  >
                    <div 
                      className="container" 
                      draggable 
                      onDragStart={(e) => dragStart(e, outerItem.children[0], "container", outerItem.id)}
                    >
                      <RVI16 iconDef={rvi16TriangleUp()} className="mr-1.5" />
                      {outerItem.children[0].name}
                    </div>
                  </div>
                ) : (
                  <div 
                    className="interface" 
                    onDragOver={(e) => e.preventDefault()} 
                    onDrop={() => drop(outerItem.id, "interface")}
                  > 
                    {outerItem.name && (
                      <div className="interface-header f-btw">
                        {outerItem.name} 
                        {outerItem.name.startsWith("bond") && (
                          <RVI36 iconDef={rvi36Edit} className="icon" onClick={() => openBondingPopup("edit")} />
                        )}
                      </div>
                    )}
                    <div className="children">
                      {outerItem.children.map((child) => (
                        <div 
                          key={child.id} 
                          className="container" 
                          draggable 
                          onDragStart={(e) => dragStart(e, child, "container", outerItem.id)}
                        >
                          {status2Icon(child?.status)}
                          <RVI16 iconDef={rvi16TriangleUp()} className="mr-1.5" />
                          {child.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 화살표 */}
                <div className="flex items-center justify-center">
                  <RVI24 iconDef={rvi24CompareArrows()} className="icon" />
                </div>

                {/* 네트워크 영역 */}
                {outerItem.networks.length === 0 ? (
                  // ✅ 네트워크 없을 경우: .assigned-network-outer 제거, 넓이 41%
                  <div 
                    className="outer-networks f-center" 
                    style={{ width: "41%"}}
                    onDragOver={(e) => e.preventDefault()} 
                    onDrop={() => drop(outerItem.id, "networkOuter")}
                  >
                    <div className="assigned-network">
                      <span>할당된 네트워크 없음</span>
                    </div>
                  </div>
                ) : (
                  // ✅ 네트워크 있을 경우: 기존 구조 유지
                  <div className="assigned-network-outer">
                    <div 
                      className="outer-networks" 
                      onDragOver={(e) => e.preventDefault()} 
                      onDrop={() => drop(outerItem.id, "networkOuter")}
                    >
                      {outerItem.networks.map(network => (
                        <div 
                          key={network.id} 
                          className="center" 
                          draggable 
                          onDragStart={(e) => dragStart(e, network, "networkOuter", outerItem.id)}
                        >
                          <div className="left-section">
                            {status2Icon(network?.status)}{network.name}
                          </div>
                          <div className="right-section">
                            {network?.role && <FontAwesomeIcon icon={faDesktop} className="icon" />}
                            <RVI36 iconDef={rvi36Edit} className="icon" onClick={() => openNetworkEditPopup(network)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
          ))}
        </div>

        <div
          className="network-separation-right"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => drop(null, "unassigned")}
        >
          <div className ="unassigned-network">
            <div>할당되지 않은 논리 네트워크</div>
          </div>
        
          {availableNetworks?.map((net) => (
            <div
              key={net.id}
              className="network-item"
              draggable
              onDragStart={(e) => dragStart(e, net, "unassigned")}
            >
              <div className="flex text-left">
                {status2Icon(net?.status)}{net?.name}<br/>
                {net?.vlan === 0 ? "":`(VLAN ${net?.vlan})` }
              </div>
              <RVI16 iconDef={rvi16VirtualMachine} className="icon" />
            </div>
          ))}
        </div>
      </div>
      <LabelCheckbox
        id="checkHostEngineConnectivity" 
        label="호스트와 Engine간의 연결을 확인"
      />
      <LabelCheckbox 
      id="saveNetworkConfiguration"
      label="네트워크 설정 저장"
      />
      <Suspense fallback={<Loading/>}>
        {/* 네트워크쪽 연필 추가모달 */}
        {isNetworkEditPopupOpen && selectedNetwork && (
          <HostNetworkEditModal
            isOpen={isNetworkEditPopupOpen}
            onClose={() => setIsNetworkEditPopupOpen(false)}
            network={selectedNetwork}
          />
        )}
        {/* 본딩 */}
        {isBondingPopupOpen && selectedBonding && (
          <HostNetworkBondingModal
            isOpen={isBondingPopupOpen}
            editmode
            onClose={() => setIsBondingPopupOpen(false)}
          />
        )}
      </Suspense>

    </>
  );
}

export default HostNics;