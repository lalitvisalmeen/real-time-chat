import ChatLayout from './ChatLayout';
import AppLayout from '@/layouts/app-layout';
import { ReactNode } from 'react';



function Home() {
    return <> </>;
}

Home.layout = (page:ReactNode) => {
    return (
        <AppLayout>
            <ChatLayout>{page}</ChatLayout>
        </AppLayout>
    );
};

export default Home;
