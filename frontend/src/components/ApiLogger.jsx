import React, { useState, useEffect } from 'react';
import { Terminal, ChevronUp, ChevronDown, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { registerApiLogCallback } from '../services/apiStub';

export default function ApiLogger() {
  const [logs, setLogs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    registerApiLogCallback((newLog) => {
      setLogs((prev) => [newLog, ...prev].slice(0, 15)); // Keep last 15 calls
      setIsOpen(true); // Auto expand on new REST traffic
    });
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      width: '380px',
      zIndex: 999,
      fontFamily: 'monospace',
      fontSize: '0.75rem',
      borderRadius: '12px',
      border: '1px solid #1e293b',
      backgroundColor: '#0f172a',
      color: '#cbd5e1',
      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.3)',
      overflow: 'hidden',
      transition: 'max-height var(--transition-normal)'
    }}>
      {/* Header Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px 14px',
          borderBottom: isOpen ? '1px solid #1e293b' : 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          backgroundColor: '#1e293b'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
          <Terminal size={14} />
          <strong>Flask REST API Logs</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            fontSize: '0.65rem', 
            backgroundColor: '#0f172a', 
            color: '#10b981', 
            padding: '2px 6px', 
            borderRadius: '4px',
            fontWeight: 700
          }}>
            MOCK GATEWAY
          </span>
          {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </div>

      {/* Logs Content */}
      {isOpen && (
        <div style={{
          maxHeight: '260px',
          overflowY: 'auto',
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {logs.length === 0 ? (
            <div style={{ color: '#64748b', padding: '20px 0', textAlign: 'center' }}>
              <ShieldCheck size={24} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
              No Flask REST API requests captured yet.
            </div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} style={{ 
                borderBottom: idx < logs.length - 1 ? '1px solid #1e293b' : 'none',
                paddingBottom: '6px',
                lineHeight: '1.4'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span>
                    <span style={{ 
                      color: log.method === 'GET' ? '#38bdf8' : '#fb923c', 
                      fontWeight: 'bold',
                      marginRight: '6px'
                    }}>
                      {log.method}
                    </span>
                    <span style={{ color: '#e2e8f0' }}>{log.endpoint}</span>
                  </span>
                  <span style={{ color: '#64748b' }}>{log.timestamp}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                  <span style={{ color: log.status >= 300 ? '#f87171' : '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {log.status >= 300 ? <AlertTriangle size={10} /> : <CheckCircle size={10} />}
                    Status: {log.status}
                  </span>
                  <span style={{ color: '#64748b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                    {log.response}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
