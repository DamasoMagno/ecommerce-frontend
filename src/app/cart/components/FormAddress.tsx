"use client";
import { FieldError, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { useUserInfo } from "@/context/User";

import { Button } from "@/components/Button";
import { Input } from "../../../components/Input";

const userAddressSchema = z.object({
  street: z.string().min(1, "Informe sua rua"),
  neighborhood: z.string().min(1, "Informe o seu bairro"),
  number: z.coerce.number().min(1, "Informe o número"),
  zipCode: z.coerce.number().min(1, "Informe o cep"),
  complement: z.string().optional(),
});

export type AddressInput = z.infer<typeof userAddressSchema>;

export function FormAddress() {
  const router = useRouter();
  const { address, registerUserAddress, updateExistingAddress, user } =
    useUserInfo()

  const userEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const isSubmitDisabled = !userEmail;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<AddressInput>({
    resolver: zodResolver(userAddressSchema),
    values: {
      street: address?.street ?? "",
      neighborhood: address?.neighborhood ?? "",
      complement: address?.complement ?? "",
      number: address?.number ?? 0,
      zipCode: address?.zipCode ?? 0,
    },
  });

  async function searchCep(code: string) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${code.padStart(8, '0')}/json`)
      const data = await response.json()

      return data
    } catch (error) {
      toast.error("Insira um CEP válido.")
    }
  }

  const handleRegisterAddress = async (addressInput: AddressInput) => {
    if (!user) {
      return router.push("/sign");
    }

    try {
      const data = await searchCep(String(addressInput.zipCode))

      if (data.localidade !== "Itapipoca") {
        toast("Não entregamos fora de itapipoca")
        return
      }

      if (address) {
        await updateExistingAddress(addressInput);
        return;
      }

      await registerUserAddress(addressInput);
    } catch (error) { }
  };

  async function fillFields(event: any) {
    const response = await searchCep(event.target.value)

    if (response && !response.erro) {
      setValue("neighborhood", response.bairro)
      setValue("street", response.logradouro)
    }
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(handleRegisterAddress)}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="CEP" className="text-white text-sm">
          CEP
        </label>
        <Input id="CEP" {...register("zipCode", { onBlur: fillFields })} />
        {invalidFieldError(errors.zipCode)}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="neighborhood" className="text-white text-sm">
          Bairro
        </label>
        <Input id="neighborhood" {...register("neighborhood")} />
        {invalidFieldError(errors.neighborhood)}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="address" className="text-white text-sm">
          Rua
        </label>
        <Input id="address" {...register("street")} />
        {invalidFieldError(errors.street)}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="number" className="text-white text-sm">
          Número
        </label>
        <Input id="number" {...register("number")} />
        {invalidFieldError(errors.number)}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="complement" className="text-white text-sm">
          Complemento <small>(opcional)</small>
        </label>
        <Input id="complement" {...register("complement")} />
      </div>

      <Button
        className="bg-transparent border-[#543cb3] border-2 !text-[#543cb3]"
        disabled={isSubmitDisabled || isSubmitting}
        loading={isSubmitting}
      >
        Salvar endereço
      </Button>
    </form>
  );
}

const invalidFieldError = (error: FieldError | undefined) => {
  return error && <p className="text-white text-xs">{error.message}</p>;
};

