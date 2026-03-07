import RegisterForm from "@/components/RegisterForm"

export default function UserRegister() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/user.png')",
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative z-10 text-center">
        <RegisterForm role="user" />
      </div>
    </div>
  )
}