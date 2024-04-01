"use client";
import { useEffect, useState } from "react";
import { FieldError, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignalIcon, Edit } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

import { sendMessageToWhatsapp } from "@/utils/send-message-to-whatsapp";
import { getDealerRequest, sendResaleRequest } from "@/graphql/mutations/sendResaleRequest";

import { useUserInfo } from "@/context/User";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { RequestStatus } from "../components/RequestStatus";

const requestResaleSchema = z.object({
  dealer: z.string().min(1, "Informe seu nome"),
  enterprise: z.string().min(1, "Informe sua empresa"),
  contact: z.coerce.number().min(1, "Informe seu número")
});

export type RequestResaleInput = z.infer<typeof requestResaleSchema>;

export default function Dealer() {
  const { user } = useUserInfo();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    getValues
  } = useForm<RequestResaleInput>({
    resolver: zodResolver(requestResaleSchema),
    defaultValues: {
      enterprise: "",
      dealer: "",
      contact: 0
    },
  });

  const [loadingRequest, setLoadingRequest] = useState(true)
  const [resaleApprovedRef, setResaleApproved] = useState(false)

  async function handleResaleRequest(dealer: RequestResaleInput) {
    if (!user) return

    const response = await sendResaleRequest({
      email: user.primaryEmailAddress.emailAddress,
      dealer
    });

    const requestResaleMessage = `
      Solicitante para revenda
      Email: *${user.primaryEmailAddress.emailAddress}*
      Revendedor: *${dealer.dealer}* 
      Empresa: *${dealer.enterprise}*
      Contato: *${dealer.contact}*  
    `;

    toast.success("Solicitação enviada!");

    if (response && !response?.createResale.approvedRequest) {
      sendMessageToWhatsapp(requestResaleMessage);
    }
  }

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        const { resale } = await getDealerRequest(user.primaryEmailAddress?.emailAddress);

        if (resale) {
          setValue("contact", resale.contact)
          setValue("enterprise", resale.enterprise)
          setValue("dealer", resale.dealer)
        }

        if (resale && resale.approvedRequest) {
          setResaleApproved(true)
        }

      } finally {
        setLoadingRequest(false)
      }
    }

    loadData()
  }, [setValue, user]);

  return (
    <>
      <main className="max-w-xl mx-auto mt-4 px-4 flex flex-col">
        <form
          className="flex flex-col"
          onSubmit={handleSubmit(handleResaleRequest)}
        >
          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="enterprise" className="text-white text-base">
                Empresa
              </label>

              <Input id="enterprise" {...register("enterprise")} />
              {invalidFieldError(errors.enterprise)}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="dealer" className="text-white text-base">
                Revendedor
              </label>

              <Input id="dealer" {...register("dealer")} />
              {invalidFieldError(errors.dealer)}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="contact" className="text-white text-base">
                Contato
              </label>

              <Input
                id="contact"
                {...register("contact")}
                type="number"
              />
              {invalidFieldError(errors.contact)}
            </div>

            {loadingRequest ? (
              <div className="rounded-md h-12 bg-[#1A1A1A] animate-pulse" />
            ) : (
              <RequestStatus status={resaleApprovedRef} />
            )}
          </div>

          <Button
            className="w-full px-4  mt-6 md:self-end flex items-center gap-2 transition-all"
            disabled={!user || loadingRequest}
            loading={isSubmitting}
          >
            {getValues("dealer") ? (
              <>
                <Edit size={14} /> Atualizar dados
              </>
            ) : (
              <>
                <SignalIcon size={14} /> Solicitar revenda
              </>
            )}
          </Button>
        </form>
      </main >
    </>
  );
}

const invalidFieldError = (error: FieldError | undefined) => {
  return error && <p className="text-white text-xs">{error.message}</p>;
};
