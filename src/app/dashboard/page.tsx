"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


export default function Dashboard() {
    const router = useRouter();
    return (<div><p>"Aqui é DASHBOARD"</p>
        <Button
            type="submit"
            className="w-40"
            onClick={() => router.push("/login")}
        >
            Voltar
        </Button></div>);
}
