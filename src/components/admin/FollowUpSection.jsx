// import {
//   CalendarDays,
//   Clock3,
//   ArrowRight,
// } from "lucide-react";

// import { Link } from "react-router-dom";

// import { useEffect, useState } from "react";

// import leadService from "../../services/leadService";


// function FollowUpSection() {

//   const [overdue, setOverdue] =
//     useState([]);

//   const [today, setToday] =
//     useState([]);

//   const [upcoming, setUpcoming] =
//     useState([]);

//   const [loading, setLoading] =
//     useState(true);


// useEffect(() => {
//   const fetchFollowUps = async () => {
//     try {
//       const response = await leadService.getFollowUps();

//       const filterActiveLeads = (leads = []) =>
//         leads.filter(
//           (lead) =>
//             lead.status?.toLowerCase() !== "won" &&
//             lead.status?.toLowerCase() !== "lost"
//         );

//       setOverdue(filterActiveLeads(response.overdue));
//       setToday(filterActiveLeads(response.today));
//       setUpcoming(filterActiveLeads(response.upcoming));
//     } catch (error) {
//       console.error(
//         "Failed to fetch follow-ups:",
//         error
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchFollowUps();
// }, []);

//   if (loading) {
//     return (
//       <div className="grid gap-6 lg:grid-cols-3">

//         <Skeleton />

//         <Skeleton />

//         <Skeleton />

//       </div>
//     );
//   }


//   return (
//     <div className="grid gap-6 lg:grid-cols-3">

//       <FollowUpCard
//         title="Overdue Follow-ups"
//         icon={<Clock3 size={20} />}
//         leads={overdue}
//         emptyMessage="No overdue follow-ups."
//       />

//       {/* Today's Follow-ups */}
//       <FollowUpCard
//         title="Today's Follow-ups"
//         icon={
//           <CalendarDays size={20} />
//         }
//         leads={today}
//         emptyMessage="No follow-ups scheduled for today."
//       />


//       {/* Upcoming */}
//       <FollowUpCard
//         title="Upcoming Follow-ups"
//         icon={
//           <Clock3 size={20} />
//         }
//         leads={upcoming}
//         emptyMessage="No upcoming follow-ups."
//       />

//     </div>
//   );
// }


// function FollowUpCard({
//   title,
//   icon,
//   leads,
//   emptyMessage,
// }) {
//   return (
//     <section
//       className="
//         rounded-2xl
//         border
//         border-gray-200
//         bg-white
//         p-6
//         shadow-sm
//         dark:border-gray-800
//         dark:bg-gray-900
//       "
//     >

//       <div className="mb-5 flex items-center justify-between">

//         <div className="flex items-center gap-3">

//           <div
//             className="
//               flex h-10 w-10
//               items-center justify-center
//               rounded-xl
//               bg-blue-100
//               text-blue-600
//               dark:bg-blue-500/10
//               dark:text-blue-400
//             "
//           >
//             {icon}
//           </div>

//           <h2 className="font-bold text-gray-900 dark:text-white">
//             {title}
//           </h2>

//         </div>

//         <span
//           className="
//             rounded-full
//             bg-gray-100
//             px-2.5 py-1
//             text-xs
//             font-semibold
//             text-gray-600
//             dark:bg-gray-800
//             dark:text-gray-400
//           "
//         >
//           {leads.length}
//         </span>

//       </div>


//       {leads.length === 0 ? (

//         <div className="py-8 text-center">

//           <CalendarDays
//             size={30}
//             className="mx-auto text-gray-300 dark:text-gray-700"
//           />

//           <p className="mt-3 text-sm text-gray-500 dark:text-gray-500">
//             {emptyMessage}
//           </p>

//         </div>

//       ) : (

//         <div className="space-y-3">

//           {leads.slice(0, 5).map(
//             (lead) => (
//               <Link
//                 key={lead._id}
//                 to={`/admin/leads/${lead._id}`}
//                 className="
//                   block
//                   rounded-xl
//                   border
//                   border-gray-200
//                   p-4
//                   transition
//                   hover:border-blue-300
//                   hover:bg-blue-50/50
//                   dark:border-gray-800
//                   dark:hover:border-blue-800
//                   dark:hover:bg-blue-500/5
//                 "
//               >

//                 <div className="flex items-center justify-between gap-4">

//                   <div className="min-w-0">

//                     <p className="truncate font-semibold text-gray-900 dark:text-white">
//                       {lead.name}
//                     </p>

//                     <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-500">
//                       {lead.company ||
//                         lead.email}
//                     </p>

//                   </div>


//                   <div className="shrink-0 text-right">

//                     <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">

//                       {new Date(
//                         lead.followUpDate
//                       ).toLocaleTimeString(
//                         "en-IN",
//                         {
//                           hour: "numeric",
//                           minute: "2-digit",
//                         }
//                       )}

//                     </p>

//                     <p className="mt-1 text-[11px] uppercase text-gray-400">
//                       {lead.status}
//                     </p>

//                   </div>

//                 </div>

//               </Link>
//             )
//           )}


//           {leads.length > 5 && (
//             <Link
//               to="/admin/leads"
//               className="
//                 flex
//                 items-center
//                 justify-center
//                 gap-2
//                 pt-3
//                 text-sm
//                 font-semibold
//                 text-blue-600
//                 dark:text-blue-400
//               "
//             >
//               View all
//               <ArrowRight size={15} />
//             </Link>
//           )}

//         </div>

//       )}

//     </section>
//   );
// }


// function Skeleton() {
//   return (
//     <div
//       className="
//         h-72
//         animate-pulse
//         rounded-2xl
//         bg-gray-200
//         dark:bg-gray-800
//       "
//     />
//   );
// }


// export default FollowUpSection;






import {
  CalendarDays,
  Clock3,
  ArrowRight,
  ArrowLeft,
  X,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useEffect, useState } from "react";

import leadService from "../../services/leadService";


function FollowUpSection() {
  const [overdue, setOverdue] = useState([]);

  const [today, setToday] = useState([]);

  const [upcoming, setUpcoming] = useState([]);

  const [loading, setLoading] = useState(true);

  // Controls the modal
  const [selectedFollowUps, setSelectedFollowUps] = useState(null);


  useEffect(() => {
    const fetchFollowUps = async () => {
      try {
        const response = await leadService.getFollowUps();

        const filterActiveLeads = (leads = []) =>
          leads.filter(
            (lead) =>
              lead.status?.toLowerCase() !== "won" &&
              lead.status?.toLowerCase() !== "lost"
          );

        setOverdue(filterActiveLeads(response.overdue));
        setToday(filterActiveLeads(response.today));
        setUpcoming(filterActiveLeads(response.upcoming));
      } catch (error) {
        console.error(
          "Failed to fetch follow-ups:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFollowUps();
  }, []);


  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );
  }


  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Overdue */}
        <FollowUpCard
          title="Overdue Follow-ups"
          icon={<Clock3 size={20} />}
          leads={overdue}
          emptyMessage="No overdue follow-ups."
          onSeeAll={() =>
            setSelectedFollowUps({
              title: "Overdue Follow-ups",
              icon: <Clock3 size={20} />,
              leads: overdue,
            })
          }
        />

        {/* Today */}
        <FollowUpCard
          title="Today's Follow-ups"
          icon={<CalendarDays size={20} />}
          leads={today}
          emptyMessage="No follow-ups scheduled for today."
          onSeeAll={() =>
            setSelectedFollowUps({
              title: "Today's Follow-ups",
              icon: <CalendarDays size={20} />,
              leads: today,
            })
          }
        />

        {/* Upcoming */}
        <FollowUpCard
          title="Upcoming Follow-ups"
          icon={<Clock3 size={20} />}
          leads={upcoming}
          emptyMessage="No upcoming follow-ups."
          onSeeAll={() =>
            setSelectedFollowUps({
              title: "Upcoming Follow-ups",
              icon: <Clock3 size={20} />,
              leads: upcoming,
            })
          }
        />

      </div>


      {/* Full Follow-ups Modal */}
      {selectedFollowUps && (
        <FollowUpsModal
          title={selectedFollowUps.title}
          icon={selectedFollowUps.icon}
          leads={selectedFollowUps.leads}
          onClose={() => setSelectedFollowUps(null)}
        />
      )}
    </>
  );
}


/* =========================================================
   FOLLOW-UP CARD
========================================================= */

function FollowUpCard({
  title,
  icon,
  leads,
  emptyMessage,
  onSeeAll,
}) {
  return (
    <section
      className="
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-6
        shadow-sm
        dark:border-gray-800
        dark:bg-gray-900
      "
    >

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              bg-blue-100
              text-blue-600
              dark:bg-blue-500/10
              dark:text-blue-400
            "
          >
            {icon}
          </div>

          <h2 className="font-bold text-gray-900 dark:text-white">
            {title}
          </h2>

        </div>


        {/* Total Count */}
        <span
          className="
            rounded-full
            bg-gray-100
            px-2.5 py-1
            text-xs
            font-semibold
            text-gray-600
            dark:bg-gray-800
            dark:text-gray-400
          "
        >
          {leads.length}
        </span>

      </div>


      {/* Empty State */}
      {leads.length === 0 ? (

        <div className="py-8 text-center">

          <CalendarDays
            size={30}
            className="mx-auto text-gray-300 dark:text-gray-700"
          />

          <p className="mt-3 text-sm text-gray-500 dark:text-gray-500">
            {emptyMessage}
          </p>

        </div>

      ) : (

        <div className="space-y-3">

          {/* Show only 2 */}
          {leads.slice(0, 2).map((lead) => (
            <FollowUpItem
              key={lead._id}
              lead={lead}
            />
          ))}


          {/* See All */}
          {leads.length > 2 && (
            <button
              type="button"
              onClick={onSeeAll}
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                pt-3
                text-sm
                font-semibold
                text-blue-600
                transition
                hover:text-blue-700
                dark:text-blue-400
                dark:hover:text-blue-300
              "
            >
              See all

              <ArrowRight size={15} />
            </button>
          )}

        </div>

      )}

    </section>
  );
}


/* =========================================================
   FOLLOW-UP ITEM
========================================================= */

function FollowUpItem({ lead }) {
  return (
    <Link
      to={`/admin/leads/${lead._id}`}
      className="
        block
        rounded-xl
        border
        border-gray-200
        p-4
        transition
        hover:border-blue-300
        hover:bg-blue-50/50
        dark:border-gray-800
        dark:hover:border-blue-800
        dark:hover:bg-blue-500/5
      "
    >

      <div className="flex items-center justify-between gap-4">

        {/* Lead Information */}
        <div className="min-w-0">

          <p className="truncate font-semibold text-gray-900 dark:text-white">
            {lead.name}
          </p>

          <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-500">
            {lead.company || lead.email}
          </p>

        </div>


        {/* Follow-up Information */}
        <div className="shrink-0 text-right">

          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">

            {new Date(
              lead.followUpDate
            ).toLocaleTimeString(
              "en-IN",
              {
                hour: "numeric",
                minute: "2-digit",
              }
            )}

          </p>

          <p className="mt-1 text-[11px] uppercase text-gray-400">
            {lead.status}
          </p>

        </div>

      </div>

    </Link>
  );
}


/* =========================================================
   FOLLOW-UPS MODAL
========================================================= */

function FollowUpsModal({
  title,
  icon,
  leads,
  onClose,
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        p-4
        backdrop-blur-md
        sm:p-6
      "
    >

      {/* Modal */}
      <div
        className="
          flex
          max-h-[90vh]
          w-full
          max-w-3xl
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-gray-200
          bg-white
          shadow-2xl
          dark:border-gray-800
          dark:bg-gray-900
        "
      >

        {/* Modal Header */}
        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-gray-200
            px-6
            py-5
            dark:border-gray-800
          "
        >

          <div className="flex items-center gap-3">

            {/* Back Button */}
            <button
              type="button"
              onClick={onClose}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                text-gray-500
                transition
                hover:bg-gray-100
                hover:text-gray-900
                dark:hover:bg-gray-800
                dark:hover:text-white
              "
              aria-label="Back"
            >
              <ArrowLeft size={19} />
            </button>


            {/* Icon */}
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-blue-100
                text-blue-600
                dark:bg-blue-500/10
                dark:text-blue-400
              "
            >
              {icon}
            </div>


            {/* Title */}
            <div>

              <h2 className="font-bold text-gray-900 dark:text-white">
                {title}
              </h2>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {leads.length} follow-up
                {leads.length !== 1 ? "s" : ""}
              </p>

            </div>

          </div>


          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-gray-400
              transition
              hover:bg-gray-100
              hover:text-gray-700
              dark:hover:bg-gray-800
              dark:hover:text-white
            "
            aria-label="Close"
          >
            <X size={19} />
          </button>

        </div>


        {/* Modal Content */}
        <div
          className="
            flex-1
            overflow-y-auto
            p-6
          "
        >

          <div className="space-y-3">

            {leads.map((lead) => (
              <FollowUpItem
                key={lead._id}
                lead={lead}
              />
            ))}

          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   SKELETON
========================================================= */

function Skeleton() {
  return (
    <div
      className="
        h-72
        animate-pulse
        rounded-2xl
        bg-gray-200
        dark:bg-gray-800
      "
    />
  );
}


export default FollowUpSection;