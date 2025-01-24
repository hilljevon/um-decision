import MainCard from "@/components/user/MainCard";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <header className="top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
        <h1 className="text-xl font-semibold">OURS</h1>
      </header>
      <div className="container mx-auto px-10 py-4">
        <form className="grid w-full items-start gap-6">
          <fieldset className="grid gap-6 rounded-lg border p-4">
            <legend className="-ml-1 px-1 text-sm font-bold">UM Decision</legend>
            <MainCard />
          </fieldset>
        </form>
      </div>
    </>
  );
}
