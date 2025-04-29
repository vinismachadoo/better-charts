import LiveBuses from '@/app/buses/components/live-buses';

type Props = {
  params: Promise<{}>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

const Page = async ({ searchParams }: Props) => {
  return <LiveBuses />;
};

export default Page;
