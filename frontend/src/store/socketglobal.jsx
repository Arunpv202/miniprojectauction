import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:8045";

const socket = io(import.meta.env.VITE_API_URL||SOCKET_URL, { autoConnect: false });

export default socket;
