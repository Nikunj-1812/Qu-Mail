import { getApiBaseUrl } from '@/lib/constants';
import { InterceptedPacket } from '@/types/network';

export const networkApi = {
  async getWireLog(): Promise<InterceptedPacket[]> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/network/wire-log/`);
    if (!res.ok) {
      throw new Error('Failed to fetch network wire log.');
    }
    return res.json();
  },
};
