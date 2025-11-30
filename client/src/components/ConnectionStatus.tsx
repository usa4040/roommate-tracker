import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import { Wifi, WifiOff } from 'lucide-react';
import './ConnectionStatus.css';

const ConnectionStatus: React.FC = () => {
    const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
    const [showStatus, setShowStatus] = useState<boolean>(false);

    useEffect(() => {
        const onConnect = (): void => {
            setIsConnected(true);
            setShowStatus(true);
            // 接続成功メッセージは3秒後に非表示
            setTimeout(() => setShowStatus(false), 3000);
        };

        const onDisconnect = (): void => {
            setIsConnected(false);
            setShowStatus(true);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        // 初期状態の確認
        if (!socket.connected) {
            setShowStatus(true);
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, []);

    // 接続中で表示フラグがfalseの場合は何も表示しない
    if (!showStatus && isConnected) {
        return null;
    }

    return (
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-content">
                {isConnected ? (
                    <>
                        <Wifi size={16} />
                        <span>サーバーに接続しました</span>
                    </>
                ) : (
                    <>
                        <WifiOff size={16} />
                        <span>サーバーとの接続が切れました</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default ConnectionStatus;
