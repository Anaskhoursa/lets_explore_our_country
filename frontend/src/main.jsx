import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css'
import SocketWrapper from './socketWrapper';


const queryClient = new QueryClient();
const userId = "admin"; 


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SocketWrapper userId={userId}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </SocketWrapper>
  </React.StrictMode>
);
