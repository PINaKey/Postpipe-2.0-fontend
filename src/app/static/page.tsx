import { Metadata } from 'next';
import StaticConnectorClient from '@/components/static-connector-client';
import { getSession } from '@/lib/auth/actions';
import { getConnectors } from '@/lib/server-db';

export const metadata: Metadata = {
    title: 'Static Connector',
};

export default async function StaticConnectorPage() {
    const session = await getSession();
    let liveConnectorsCount = 0;
    
    if (session?.userId) {
        const connectors = await getConnectors(session.userId);
        // A connector is live if its url is set and is not "PENDING"
        liveConnectorsCount = connectors.filter(c => c.url && c.url !== "PENDING").length;
    }

    return <StaticConnectorClient liveConnectorsCount={liveConnectorsCount} />;
}
