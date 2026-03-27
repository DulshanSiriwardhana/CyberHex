import BG from "../components/ui/animated/bg";

const TestPage = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <h1>Test Page</h1>
      <p>This is a test page for development purposes.</p>
      <div className="h-full w-full min-h-250 flex">
        <BG />
      </div>
    </div>
  );
};

export default TestPage;