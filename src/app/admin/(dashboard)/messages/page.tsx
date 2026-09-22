import { ActionSubmitButton } from "@/components/admin/action-submit-button";
import { AdminPagination, AdminSearchForm, StatusTabs } from "@/components/admin/list-controls";
import { AdminPageHeader, EmptyState, Panel } from "@/components/admin/page-parts";
import { StatusBadge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { deleteMessage, updateMessageStatus } from "@/actions/admin";
import {
  customerWhatsAppHref,
  getMessageStatusCounts,
  listAdminMessages,
  paramPage,
  paramText,
} from "@/lib/admin";
import { MessageStatus } from "@/lib/constants";
import { formatDateTime, formatNumber, timeAgo } from "@/lib/format";

export const metadata = { title: "Messages" };

const BASE = "/admin/messages";

export default async function AdminMessagesPage(props: PageProps<"/admin/messages">) {
  const searchParams = await props.searchParams;

  const q = paramText(searchParams.q);
  const status = paramText(searchParams.status);
  const page = paramPage(searchParams.page);

  const [results, counts] = await Promise.all([
    listAdminMessages({ q, status, page }),
    getMessageStatusCounts(),
  ]);

  const tabs = [
    { value: "", label: "All", count: counts.total },
    { value: MessageStatus.NEW, label: "New", count: counts.counts.NEW ?? 0 },
    { value: MessageStatus.READ, label: "Read", count: counts.counts.READ ?? 0 },
    { value: MessageStatus.REPLIED, label: "Replied", count: counts.counts.REPLIED ?? 0 },
    { value: MessageStatus.ARCHIVED, label: "Archived", count: counts.counts.ARCHIVED ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Customer messages"
        description="Every enquiry from the contact form, with the customer's history one click away."
      />

      <Panel bodyClassName="p-5">
        <div className="flex flex-col gap-4">
          <AdminSearchForm
            action={BASE}
            defaultValue={q}
            placeholder="Search by name, email, subject or message…"
            params={{ status }}
          />
          <StatusTabs base={BASE} tabs={tabs} active={status} params={{ q }} />
        </div>
      </Panel>

      {results.items.length > 0 ? (
        <>
          <ul className="flex flex-col gap-4">
            {results.items.map((message) => {
              const whatsapp = customerWhatsAppHref(
                message.phone,
                `Hi ${message.name}, thanks for contacting Sundrive Autos.`,
              );

              return (
                <li key={message.id}>
                  <Panel bodyClassName="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="font-display text-base font-bold text-ink-900">
                            {message.name}
                          </h3>
                          <StatusBadge status={message.status} />
                          {message.subject && (
                            <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-600">
                              {message.subject}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-500">
                          <a
                            href={`mailto:${message.email}?subject=${encodeURIComponent(
                              `Re: ${message.subject ?? "Your enquiry"}`,
                            )}`}
                            className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-600"
                          >
                            <Icon name="mail" className="h-3.5 w-3.5 text-ink-300" />
                            {message.email}
                          </a>
                          {message.phone && (
                            <a
                              href={`tel:${message.phone}`}
                              className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-600"
                            >
                              <Icon name="phone" className="h-3.5 w-3.5 text-ink-300" />
                              {message.phone}
                            </a>
                          )}
                          {whatsapp && (
                            <a
                              href={whatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 font-medium text-[#128C7E] transition-colors hover:underline"
                            >
                              <Icon name="whatsapp" className="h-3.5 w-3.5" />
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="text-right text-xs text-ink-400">
                        <p>{timeAgo(message.createdAt)}</p>
                        <p className="mt-0.5">{formatDateTime(message.createdAt)}</p>
                      </div>
                    </div>

                    <blockquote className="mt-4 rounded-xl border border-ink-100 bg-ink-50/60 px-4 py-3 text-sm leading-relaxed whitespace-pre-line text-ink-700">
                      {message.message}
                    </blockquote>

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
                      {Object.values(MessageStatus)
                        .filter((option) => option !== message.status)
                        .map((option) => (
                          <form action={updateMessageStatus} key={option}>
                            <input type="hidden" name="id" value={message.id} />
                            <input type="hidden" name="status" value={option} />
                            <ActionSubmitButton
                              pendingLabel="…"
                              variant={option === MessageStatus.REPLIED ? "primary" : "outline"}
                            >
                              Mark {option.charAt(0) + option.slice(1).toLowerCase()}
                            </ActionSubmitButton>
                          </form>
                        ))}

                      <form action={deleteMessage} className="ml-auto">
                        <input type="hidden" name="id" value={message.id} />
                        <ActionSubmitButton
                          icon="trash"
                          confirmMessage={`Delete the enquiry from ${message.name}?`}
                          pendingLabel="Deleting…"
                          className="border-red-200 text-red-600 hover:border-red-400 hover:bg-red-50"
                        >
                          Delete
                        </ActionSubmitButton>
                      </form>
                    </div>
                  </Panel>
                </li>
              );
            })}
          </ul>

          <AdminPagination
            base={BASE}
            page={results.page}
            totalPages={results.totalPages}
            params={{ q, status }}
          />
        </>
      ) : (
        <EmptyState
          icon="inbox"
          title={q || status ? "No messages match those filters" : "No messages yet"}
          description="Enquiries sent through the contact form land here."
        />
      )}

      <p className="text-xs text-ink-400">
        {formatNumber(results.total)} message{results.total === 1 ? "" : "s"} in this view.
      </p>
    </div>
  );
}
