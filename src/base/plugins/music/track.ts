import { Readable } from "stream";
import { AxiosRequestConfig } from "axios";

export interface StreamRequest {
    url: string;
    options?: AxiosRequestConfig;
}

export type StreamReturnType = Readable | StreamRequest;

export interface Track {
    title: string;
    url: string;
    duration?: number;
    thumbnail?: string;
    source: string;
    requester: string;
    getStream: () => Promise<StreamReturnType>;
}
