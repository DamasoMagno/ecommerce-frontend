import { AlertCircle, CheckCircle } from "lucide-react";

export function RequestStatus({ status = false }: { status: boolean }) {
  return (
    <div
      className={`
        rounded-md flex items-center justify-center gap-2 h-12 font-bold border-2
        ${status ?
          "bg-green-400/25 border-green-500/70 text-green-500" :
          "bg-yellow-400/25 border-yellow-500/70 text-yellow-500"
        }
      `}
    >
      {
        status ? (
          <>
            <CheckCircle size={16} /> Aprovado
          </>
        ) : (
          <>
            <AlertCircle size={16} /> Não aprovado
          </>
        )
      }
    </div>
  )
}