import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Route, Routes, useRouteError } from "react-router-dom";
import { scan } from "react-scan";
import STOMP from "./Socket";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import Home from "./components/Home";

import Login from "./pages/login/Login";
import VmVnc from "./pages/computing/vm/VmVnc";
import Dashboard from "./pages/dashboard/Dashboard";
import RutilManager from "./pages/Rutil/RutilManager";
import DataCenterInfo from "./pages/computing/datacenter/DataCenterInfo";
import ClusterInfo from "./pages/computing/cluster/ClusterInfo";
import HostInfo from "./pages/computing/host/HostInfo";
import AllVm from "./pages/computing/vm/AllVm";
import VmInfo from "./pages/computing/vm/VmInfo";
import AllTemplates from "./pages/computing/template/AllTemplates";
import TemplateInfo from "./pages/computing/template/TemplateInfo";
import AllNetwork from "./pages/network/network/AllNetwork";
import NetworkInfo from "./pages/network/network/NetworkInfo";
import AllVnic from "./pages/network/vnicProfile/AllVnic";
import VnicProfileInfo from "./pages/network/vnicProfile/VnicProfileInfo";
import AllDomain from "./pages/storage/domain/AllDomain";
import DomainInfo from "./pages/storage/domain/DomainInfo";
import AllDisk from "./pages/storage/disk/AllDisk";
import DiskInfo from "./pages/storage/disk/DiskInfo";
import Event from "./pages/event/Event";
import SettingInfo from "./pages/setting/SettingInfo";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "pretendard/dist/web/static/pretendard.css";
import Logger from "./utils/Logger";
import "./App.css";
import useUIState from "./hooks/useUIState";
import ErrorBoundary from "./pages/ErrorBoundary";

const App = () => {
  //#region: 웹소켓연결
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const {
    setLoginBoxVisible, setEventBoxVisible
  } = useUIState()
  useEffect(() => {
    setEventBoxVisible(false)
    setLoginBoxVisible(false)

    // Connect using STOMP
    STOMP.connect({}, (frame) => {
      Logger.debug("Connected: " + frame);

      // Subscribe to a topic
      STOMP.subscribe("/topic/public", (res) => {
        const receivedMessage = JSON.parse(res.body);
        Logger.debug(`message received! ... ${receivedMessage}`);
        showMessage(receivedMessage);
        showToast(receivedMessage); // Show toast on message receive
      });
    });

    // Set stomp client in state
    setStompClient(STOMP);

    // Cleanup on component unmount
    return () => {
      if (STOMP) {
        STOMP.disconnect(() => {
          Logger.debug("Disconnected from STOMP");
        });
      }
    };
  }, []);
  //#endregion: 웹소켓연결

  const showMessage = (message) => {
    Logger.debug(`App > showMessage ...`);
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const showToast = (msg) => {
    Logger.debug(`App > showToast ...`);
    toast(`${msg.content}`, {
      icon: `${msg.symbol}`,
      duration: 1500,
      ariaProps: {
        role: "status",
        "aria-live": "polite",
      },
    });
  };


  // react-scan 설정
  scan({
    enabled: false,
    log: true,
    trackUnnecessaryRenders: true,
  });

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* 공개경로  */}
          <Route path="login" element={<Login />} />
          <Route path="vnc/:id" element={<VmVnc />} />

          <Route element={<RequireAuth />}>
            {/* 사용자 인증 필요 */}
            <Route exact path="/" element={<Home />} >
              <Route path="/" element={<Dashboard />} errorElement={<ErrorBoundary/>} />
              <Route path="computing/rutil-manager" element={<RutilManager />} errorElement={<ErrorBoundary/>} />
              <Route path="computing/rutil-manager/:section" element={<RutilManager />} errorElement={<ErrorBoundary/>} />

              <Route path="computing/datacenters/:id/:section" element={<DataCenterInfo />} errorElement={<ErrorBoundary/>} />

              <Route path="computing/clusters/:id" element={<ClusterInfo />} errorElement={<ErrorBoundary/>} />
              <Route path="computing/clusters/:id/:section" element={<ClusterInfo />} errorElement={<ErrorBoundary/>} />
              
              <Route path="computing/hosts/:id" element={<HostInfo />} errorElement={<ErrorBoundary/>} />
              <Route path="computing/hosts/:id/:section" element={<HostInfo />} errorElement={<ErrorBoundary/>} />

              <Route path="computing/vms" element={<AllVm />} errorElement={<ErrorBoundary/>} />
              <Route path="computing/vms/:id" element={<VmInfo />} errorElement={<ErrorBoundary/>} />
              <Route path="computing/vms/:id/:section" element={<VmInfo />} errorElement={<ErrorBoundary/>} />
              <Route path="computing/vms/templates" element={<AllTemplates />} errorElement={<ErrorBoundary/>} />
              
              <Route path="computing/templates" element={<AllTemplates />} errorElement={<ErrorBoundary/>} />
              <Route path="computing/templates/:id" element={<TemplateInfo />} errorElement={<ErrorBoundary/>} />
              <Route path="computing/templates/:id/:section" element={<TemplateInfo />} errorElement={<ErrorBoundary/>} />
                            
              <Route path="networks" element={<AllNetwork />} errorElement={<ErrorBoundary/>} />
              <Route path="networks/rutil-manager" element={<RutilManager />} errorElement={<ErrorBoundary/>} />
              <Route path="networks/datacenters/:id/:section" element={<DataCenterInfo />} errorElement={<ErrorBoundary/>} />
              <Route path="networks/:id" element={<NetworkInfo />} errorElement={<ErrorBoundary/>} />
              <Route path="networks/:id/:section" element={<NetworkInfo />} errorElement={<ErrorBoundary/>} />

              <Route path="vnicProfiles" element={<AllVnic />} errorElement={<ErrorBoundary/>} />
              <Route path="vnicProfiles/:id/:section" element={<VnicProfileInfo />} errorElement={<ErrorBoundary/>} />

              <Route path="storages/rutil-manager" element={<RutilManager />} errorElement={<ErrorBoundary/>} />
              <Route path="storages/rutil-manager/:section" element={<RutilManager />} errorElement={<ErrorBoundary/>} />

              <Route path="storages/domains" element={<AllDomain />} errorElement={<ErrorBoundary/>} />
              <Route path="storages/datacenters/:id/:section" element={<DataCenterInfo />} errorElement={<ErrorBoundary/>} />
              <Route path="storages/domains/:id" element={<DomainInfo />} errorElement={<ErrorBoundary/>} />
              <Route path="storages/domains/:id/:section" element={<DomainInfo />} errorElement={<ErrorBoundary/>} />
        
              <Route path="storages/disks" element={<AllDisk />} errorElement={<ErrorBoundary/>} />
              <Route path="storages/disks/:id" element={<DiskInfo />} errorElement={<ErrorBoundary/>} />
              <Route path="storages/disks/:id/:section" element={<DiskInfo />} errorElement={<ErrorBoundary/>} />

              <Route path="events" element={<Event />} errorElement={<ErrorBoundary/>} />
              <Route path="settings/:section" element={<SettingInfo />} errorElement={<ErrorBoundary/>} />
              {/* <Route path="error" element={<ErrorBoundary />} /> */}
            </Route>
          </Route>

          <Route path="*" element={<ErrorBoundary />} />
        </Route>
      </Routes>

      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={4}
        toastOptions={{
          // duration: Infinity,
          duration: 5000, // 지속시간
          className: "toast",
          style: {
            maxWidth: 500,
          },
          ariaProps: {
            role: 'status',
            'aria-live': 'polite',
          },
          success: {
            className: "toast toast-success f-start",
          },
          error: {
            className: "toast toast-error f-start",
          },
        }}
      />
    </>
  );
};

export default App;
