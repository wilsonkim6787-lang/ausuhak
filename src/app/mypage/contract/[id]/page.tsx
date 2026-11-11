import Link from "next/link";
import { notFound } from "next/navigation";
import { requireFamily } from "@/lib/auth";
import { isUuid } from "@/lib/crm/admin-util";
import type { ContractSnapshot } from "@/lib/crm/contract";
import ContractView from "@/components/contract/ContractView";
import AgreeForm from "@/components/contract/AgreeForm";
import PrintButton from "@/components/contract/PrintButton";

export default async function ContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { sb, user, profile } = await requireFamily();
  // RLS: only this family's sent or agreed contracts are visible.
  const { data: c } = await sb
    .from("crm_contracts")
    .select("id, student_id, status, signer_role, snapshot, agreed_at, agreed_name, agreed_relation, channel")
    .eq("id", id)
    .maybeSingle();
  if (!c) notFound();
  const snap = c.snapshot as ContractSnapshot;

  let canSign = false;
  let why = "";
  if (c.status === "sent") {
    if (snap.student.minor || c.signer_role === "parent") {
      canSign = profile.role === "parent";
      why = "이 계약서는 보호자 계정으로 로그인해서 동의해 주세요. 학생은 내용을 볼 수만 있습니다.";
    } else {
      const { data: st } = await sb.from("crm_students").select("profile_id").eq("id", c.student_id).maybeSingle();
      canSign = profile.role === "student" && (!st?.profile_id || st.profile_id === user.id);
      why = "이 계약서는 학생 본인 계정으로 로그인해서 동의해 주세요.";
    }
  }

  return (
    <main className="mp-main">
      <div className="ct">
        <div>
          <h1>유학 수속 계약서</h1>
          <p className="ct-lead">
            {c.status === "agreed" ? "동의하신 계약서입니다. 언제든 다시 보고 인쇄하실 수 있습니다." : "아래 내용을 확인하고 동의하시면 수속을 시작합니다."}
          </p>
        </div>
        <ContractView
          snap={snap}
          agreed={c.status === "agreed" ? { at: c.agreed_at, name: c.agreed_name, relation: c.agreed_relation, channel: c.channel } : null}
        />
        {c.status === "sent" && canSign ? (
          <AgreeForm id={c.id} checks={snap.checks} signerLabel={snap.signer.role === "parent" ? "법정대리인" : "학생 본인"} defaultName={profile.name ?? ""} />
        ) : null}
        {c.status === "sent" && !canSign ? (
          <p className="mp-notice" role="status">
            {why}
          </p>
        ) : null}
        <div className="ct-actions">
          <Link href="/mypage" className="ct-link">
            마이페이지로
          </Link>
          <PrintButton />
        </div>
      </div>
    </main>
  );
}
