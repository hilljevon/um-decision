"use client"
import React from 'react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
interface QuestionInterface {
    id: number,
    question: string,
    tooltip: string,
    yes: number,
    no: number,
    decision: string | null,
    breadcrumb: string,
    type: string
}
// Additional Cues to Note: Verbal >> YES, Stable >> YES, SFT Clock >> Yes
const iniitalNotificationQuestions = [
    {
        id: 0,
        question: "Verbal or Fax?",
        // provides more info on question if unclear.
        tooltip: "How did NKF notify of new admission?",
        // if the answer is yes, we will trigger a new question from this array at the index specified by YES.
        yes: {
            decision: null,
            exception: null,
            newIndex: 1
        },
        // if the answer is no, we will go to index specified for NO.
        no: {
            decision: null,
            exception: null,
            newIndex: 2
        },
        // if decision equals a review outcome, then we will stop the questionaire progression.
        decision: null,
        // certain um decisions have exceptions. we will need to dynamically check for these as well.
        exception: null,
        // Types classified as MULTIPLE or Yes/No
        type: "multiple",
        // When NOT yes/no questions, CHOICES will render choices of all possible answers. We will always render YES option first
        choices: {
            yes: "Verbal",
            no: "Fax",
        },
        startTransfer: false
    },
    {
        id: 1,
        question: "Per NKF Statement, Stable or Not Stable?",
        tooltip: "Is the patient stable, per NKF?",
        yes: {
            decision: null,
            exception: null,
            newIndex: 1
        },
        no: {
            decision: null,
            exception: null,
            newIndex: 2
        },
        decision: null,
        exception: null,
        type: "",
        choices: {
            yes: "Verbal",
            no: "Fax",
        },
        startTransfer: false
    },
]
//  ** For all decisions, no will be represented by 0 and yes will equal 1.
const MainCard = () => {
    return (
        <>
            <div className="col-span-full">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink>Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink>Components</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="col-span-full my-8">
                <div className='flex w-full justify-center'>
                    <Tabs defaultValue="account" className="w-[400px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="account">Initial</TabsTrigger>
                            <TabsTrigger value="password">Concurrent</TabsTrigger>
                        </TabsList>
                        <TabsContent value="account">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Initial Review</CardTitle>
                                    <CardDescription>
                                        Make changes to your account here. Click save when you're done.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" defaultValue="Pedro Duarte" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="username">Username</Label>
                                        <Input id="username" defaultValue="@peduarte" />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button>Save changes</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                        <TabsContent value="password">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Password</CardTitle>
                                    <CardDescription>
                                        Change your password here. After saving, you'll be logged out.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="current">Current password</Label>
                                        <Input id="current" type="password" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="new">New password</Label>
                                        <Input id="new" type="password" />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button>Save password</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

        </>
    )
}

export default MainCard