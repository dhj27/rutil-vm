import React from "react";
import Modal from "react-modal";
import { Routes, Route, HashRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from "./context/AuthProvider"
import { GlobalProvider } from "./context/GlobalProvider";
import { AsideStateProvider } from "./context/AsideStateProvider";
import { FooterStateProvider } from "./context/FooterStateProvider";
import { BoxStateProvider } from './context/BoxStateProvider'
import { ContextMenuStateProvider } from "./context/ContextMenuStateProvider";
import { TMIStateProvider } from "./context/TMIStateProvider";
import { UIStateProvider } from "./context/UIStateProvider";
import { DEFAULT_REFETCH_INTERVAL_IN_MILLI_SHORT } from "@/api/RQHook"
import { DEFAULT_REFETCH_INTERVAL_IN_MILLI } from "@/api/RQHook"
import reportWebVitals from "./reportWebVitals";
import App from "./App";

if (typeof global === 'undefined') {
  window.global = window;
}
const container = document.getElementById("root");
const root = createRoot(container); // createRoot(container!) if you use TypeScript
const queryClient = new QueryClient({ //자동 refetch
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      // refetchInterval: DEFAULT_REFETCH_INTERVAL_IN_MILLI_SHORT, //10초
      refetchInterval:  DEFAULT_REFETCH_INTERVAL_IN_MILLI, // 2분    새로고침이 너무 잦아서 임시로 2분으로 걸어두었습니다
      staleTime: 0,
    },
  },
});
Modal.setAppElement("#root")

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <GlobalProvider>
          <AuthProvider>
            {/* <EventsProvider> */}
            <UIStateProvider>
              <AsideStateProvider>
                <FooterStateProvider>
                  <BoxStateProvider>
                    <ContextMenuStateProvider>
                      <TMIStateProvider>
                        <Routes>
                          <Route path="/*" element={<App />}/>
                        </Routes>
                      </TMIStateProvider>
                    </ContextMenuStateProvider>
                  </BoxStateProvider>
                </FooterStateProvider>
              </AsideStateProvider>
            </UIStateProvider>
            {/* </EventsProvider> */}
          </AuthProvider>
        </GlobalProvider>
      </HashRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
reportWebVitals();
