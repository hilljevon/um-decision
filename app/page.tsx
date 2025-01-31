import MainCard from "@/components/user/MainCard";
import { CircleHelp, HelpCircle, HelpingHandIcon, RotateCcw } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function Home() {
  return (
    <>
      <header className="top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
        <div className="flex justify-between w-full items-center">
          <div>
            <h1 className="text-xl font-semibold">OURS UM Guide</h1>
          </div>
          <div className="mr-8">
            <Dialog>
              <DialogTrigger>
                <CircleHelp className="hover:cursor-pointer" />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>UM Decision Guide</DialogTitle>
                  <DialogDescription className="text-lg">
                    Please select the tab that corresponds to the review outcome from <span className="font-extrabold underline">yesterday</span>. For <span className="font-bold underline">initial</span> notifications, proceed with the <span className="text-yellow-400 font-bold"> CCN </span> tab. <br /> <br />

                    For the <span className="text-purple-500 font-bold underline">UPSC/RUPSC</span> tab, this indicates that the previous review outcome was <span className="font-bold underline">either</span> UPSC or RUPSC. The same applies to the <span className="text-blue-500 font-bold underline">FCNA/FTCWT</span> tab. <br /> <br />

                    For example, if the review outcome from yesterday was <span className="text-red-500 font-bold">FCNA</span>, select the <span className="text-blue-500 font-bold underline">FCNA/FTCWT</span> tab and proceed with the questionnaire.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
      <MainCard />
    </>
  );
}
