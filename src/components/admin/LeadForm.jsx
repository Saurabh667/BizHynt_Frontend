import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import leadService from "../../services/leadService";
import { getDomains, getDomainEligibleAssignees } from "../../services/crmService";
import useAuthStore from "../../store/authStore";
import SelectField from "../common/SelectField";


function RegisteredField({ register, errors, label, name, type = "text", placeholder = "", required = false, ...props }) {
  const inputClass = `w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800`;
  return (
    <div>
      <label className={`mb-2 block text-sm font-medium ${errors[name] ? "text-red-600 dark:text-red-400" : ""}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input type={type} {...register(name, { required: required ? `${label} is required` : false })} placeholder={placeholder}
        className={`${inputClass} ${errors[name] ? "!border-red-500 !ring-2 !ring-red-500/10" : ""}`} aria-invalid={!!errors[name]} {...props} />
      {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name].message}</p>}
    </div>
  );
}

function LeadForm({ lead, onSuccess, onCancel }) {
  const isEditing = Boolean(lead);
  const me=useAuthStore(s=>s.user);
  const [domains,setDomains]=useState([]);const [users,setUsers]=useState([]);const [assigneesLoading,setAssigneesLoading]=useState(false);
  useEffect(()=>{getDomains().then(r=>setDomains((r.domains||[]).filter(x=>x.isActive))).catch(()=>{})},[]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      domainTypeId: "",
      assignedToId: "unassigned",
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",

      website: "",
      address: "",
      primaryDomain: "",
      finalDomain: "",
      country: "",
      state: "",
      city: "",
      pincode: "",
      currentReview: "",
      reviewSentiment: "",
      imageUrlsText: "",
      websiteStatus: "",
      https: "",
      mobileResponsive: "",
      pageSpeed: "",
      outdatedIndicators: "",

      leadScore: "",
      googleRating: "",
      googleReviewCount: "",
      googleReviewsUrl: "",
      googleMapsUrl: "",

      facebook: "",
      instagram: "",
      linkedin: "",
      youtube: "",
      socialMediaFound: "",
      socialMediaLinks: "",

      emailCount: "",
      emailSource: "",
      emailType: "",
      allEmails: "",

      source: "Website",
      importedFrom: "",
      imageUrl: "",
      topComments: "",
    },
  });

  const selectedSource = watch("source");
  const selectedDomainTypeId = watch("domainTypeId");
  useEffect(()=>{let live=true;setValue('assignedToId','unassigned');if(!selectedDomainTypeId){setUsers([]);setAssigneesLoading(false);return()=>{live=false};}setAssigneesLoading(true);getDomainEligibleAssignees(selectedDomainTypeId).then(r=>{if(live)setUsers(r.users||[])}).catch(()=>{if(live)setUsers([])}).finally(()=>{if(live)setAssigneesLoading(false)});return()=>{live=false};},[selectedDomainTypeId,setValue]);


  useEffect(() => {
    if (lead) {
      reset({
        domainTypeId: lead.domainTypeId || lead.domainType?.id || "",
        assignedToId: lead.assignedToId || lead.assignee?.id || "",
        name: lead.name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        company: lead.company || "",
        message: lead.message || "",

        website: lead.website || "",
        address: lead.address || "",
        primaryDomain: lead.primaryDomain || "",
        finalDomain: lead.finalDomain || "",
        country: lead.country || "",
        state: lead.state || "",
        city: lead.city || "",
        pincode: lead.pincode || "",
        currentReview: lead.currentReview || "",
        reviewSentiment: lead.reviewSentiment || "",
        imageUrlsText: Array.isArray(lead.imageUrls) ? lead.imageUrls.join("\n") : "",
        websiteStatus: lead.websiteStatus || "",
        https: lead.https || "",
        mobileResponsive: lead.mobileResponsive || "",
        pageSpeed: lead.pageSpeed || "",
        outdatedIndicators: lead.outdatedIndicators || "",

        leadScore: lead.leadScore ?? "",
        googleRating: lead.googleRating ?? "",
        googleReviewCount: lead.googleReviewCount ?? "",
        googleReviewsUrl: lead.googleReviewsUrl || "",
        googleMapsUrl: lead.googleMapsUrl || "",

        facebook: lead.facebook || "",
        instagram: lead.instagram || "",
        linkedin: lead.linkedin || "",
        youtube: lead.youtube || "",
        socialMediaFound: lead.socialMediaFound || "",
        socialMediaLinks: lead.socialMediaLinks || "",

        emailCount: lead.emailCount ?? "",
        emailSource: lead.emailSource || "",
        emailType: lead.emailType || "",
        allEmails: lead.allEmails || "",

        source: lead.source || "Website",
        importedFrom: lead.importedFrom || "",
        imageUrl: lead.imageUrl || "",
        topComments: lead.topComments || "",
      });
    } else {
      reset({
        domainTypeId: "",
        assignedToId: "unassigned",
        name: "",
        email: "",
        phone: "",
        company: "",
        message: "",

        website: "",
        address: "",
      primaryDomain: "",
      finalDomain: "",
      country: "",
      state: "",
      city: "",
      pincode: "",
      currentReview: "",
      reviewSentiment: "",
      imageUrlsText: "",
        websiteStatus: "",
        https: "",
        mobileResponsive: "",
        pageSpeed: "",
        outdatedIndicators: "",

        leadScore: "",
        googleRating: "",
        googleReviewCount: "",
        googleReviewsUrl: "",
        googleMapsUrl: "",

        facebook: "",
        instagram: "",
        linkedin: "",
        youtube: "",
        socialMediaFound: "",
        socialMediaLinks: "",

        emailCount: "",
        emailSource: "",
        emailType: "",
        allEmails: "",

        source: "Website",
        importedFrom: "",
        imageUrl: "",
        topComments: "",
      });
    }
  }, [lead, reset]);






// Fields that hold numbers. Empty strings become undefined so
// they're omitted entirely rather than sent as NaN/"".
const numberField = (value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const n = Number(value);

  return Number.isNaN(n) ? undefined : n;
};

// Plain text fields: trim and turn "" into undefined so empty
// inputs don't overwrite existing data with blanks.
const textField = (value) => {
  const trimmed = value?.trim?.() ?? value;
  return trimmed ? trimmed : undefined;
};

const onSubmit = async (data) => {
  try {
    const payload = {
      ...(isEditing ? (["admin","super_admin"].includes(me?.role) ? {domainTypeId:numberField(data.domainTypeId)} : {}) : {domainTypeId:numberField(data.domainTypeId),assignedToId:numberField(data.assignedToId)}),
      name: data.name.trim(),
      email: textField(data.email),
      phone: textField(data.phone),
      company: textField(data.company),
      source: data.source || "Website",
      message: textField(data.message),

      website: textField(data.website),
      address: textField(data.address),
      primaryDomain: textField(data.primaryDomain),
      finalDomain: textField(data.finalDomain),
      country: textField(data.country),
      state: textField(data.state),
      city: textField(data.city),
      pincode: textField(data.pincode),
      currentReview: textField(data.currentReview),
      reviewSentiment: textField(data.reviewSentiment),
      imageUrls: data.imageUrlsText ? [...new Set(data.imageUrlsText.split(/[,|\n]+/).map((x) => x.trim()).filter(Boolean))] : undefined,
      websiteStatus: textField(data.websiteStatus),
      https: textField(data.https),
      mobileResponsive: textField(data.mobileResponsive),
      pageSpeed: textField(data.pageSpeed),
      outdatedIndicators: textField(data.outdatedIndicators),

      leadScore: numberField(data.leadScore),
      googleRating: numberField(data.googleRating),
      googleReviewCount: numberField(data.googleReviewCount),
      googleReviewsUrl: textField(data.googleReviewsUrl),
      googleMapsUrl: textField(data.googleMapsUrl),

      facebook: textField(data.facebook),
      instagram: textField(data.instagram),
      linkedin: textField(data.linkedin),
      youtube: textField(data.youtube),
      socialMediaFound: textField(data.socialMediaFound),
      socialMediaLinks: textField(data.socialMediaLinks),

      emailCount: numberField(data.emailCount),
      emailSource: textField(data.emailSource),
      emailType: textField(data.emailType),
      allEmails: textField(data.allEmails),
      importedFrom: textField(data.importedFrom),

      imageUrl: textField(data.imageUrl),
      topComments: textField(data.topComments),
    };

    if (isEditing) {
      await leadService.updateLead(lead.id, payload);
      toast.success("Lead updated successfully");
    } else {
      await leadService.createLead(payload);
      toast.success("Lead created successfully");
    }

    onSuccess();
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Something went wrong"
    );
  }
};



  const inputClass = `
    w-full rounded-xl border
    border-slate-200 bg-slate-50
    px-4 py-3 text-sm
    outline-none transition
    focus:border-indigo-500
    focus:ring-2 focus:ring-indigo-500/20
    dark:border-slate-700
    dark:bg-slate-800
  `;

  const sectionClass = `
    rounded-2xl border
    border-slate-200
    p-5
    dark:border-slate-800
  `;

  const sectionTitleClass = `
    mb-4 text-base font-semibold
  `;



  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
        {!isEditing && <div className="grid gap-3 sm:grid-cols-2">
          <Controller name="domainTypeId" control={control} rules={{required:"Domain type is required"}} render={({field})=><SelectField {...field} label="Domain Type" required placeholder="Select domain" error={errors.domainTypeId?.message} disabled={isEditing&&!['admin','super_admin'].includes(me?.role)} options={domains.map(d=>({value:String(d.id),label:d.name}))}/>}/>
          {!isEditing&&<Controller name="assignedToId" control={control} render={({field})=><SelectField {...field} label="Assign To" placeholder="Unassigned" disabled={!selectedDomainTypeId||assigneesLoading} options={[{value:"unassigned",label:assigneesLoading?"Loading eligible users…":"Unassigned (default)"},...users.map(u=>({value:String(u.id),label:`${u.name} (${u.role.replace('_',' ')})`}))]}/>}/>}
        </div>}

      {/* ================= BASIC INFORMATION ================= */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>
          Basic Information
        </h3>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <RegisteredField register={register} errors={errors}
            label="Name"
            name="name"
            placeholder="Rahul Sharma"
            required
          />

          <RegisteredField register={register} errors={errors}
            label="Email"
            name="email"
            type="email"
            placeholder="rahul@example.com"
          />

          <RegisteredField register={register} errors={errors}
            label="Phone"
            name="phone"
            placeholder="+91 9876543210"
          />

          <RegisteredField register={register} errors={errors}
            label="Company"
            name="company"
            placeholder="ABC Solutions"
          />

          <div>
            <label className="mb-2 block text-sm font-medium">
              Source
            </label>

            <Controller name="source" control={control} render={({field})=><SelectField {...field} options={['Website','LinkedIn','WhatsApp','Email','Referral','Other'].map(x=>({value:x,label:x}))}/>}/>

            {selectedSource === "Other" && (
              <p className="mt-2 text-xs text-slate-500">
                You can enter a custom source after selecting
                Other.
              </p>
            )}
          </div>

          <RegisteredField register={register} errors={errors}
            label="Imported From"
            name="importedFrom"
            placeholder="Excel, CSV, Website, etc."
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium">
            Message
          </label>

          <textarea
            {...register("message")}
            rows={4}
            placeholder="What does the client need?"
            className={inputClass}
          />
        </div>
      </div>

      {/* ================= CLASSIFICATION & LOCATION ================= */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Classification & Location</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <RegisteredField register={register} errors={errors} label="Primary Domain / Sector" name="primaryDomain" placeholder="Education, Medical, Real Estate..." />
          <RegisteredField register={register} errors={errors} label="Final Domain / Sub-sector" name="finalDomain" placeholder="School, Hospital, Clinic..." />
          <RegisteredField register={register} errors={errors} label="Country" name="country" placeholder="India" />
          <RegisteredField register={register} errors={errors} label="State" name="state" placeholder="Uttar Pradesh" />
          <RegisteredField register={register} errors={errors} label="City" name="city" placeholder="Jhansi" />
          <RegisteredField register={register} errors={errors} label="Pincode" name="pincode" placeholder="284001" />
        </div>
      </div>

      {/* ================= WEBSITE INFORMATION ================= */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>
          Website Information
        </h3>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <RegisteredField register={register} errors={errors}
            label="Website"
            name="website"
            type="url"
            placeholder="https://example.com"
          />

          <RegisteredField register={register} errors={errors}
            label="Address"
            name="address"
            placeholder="Business address"
          />

          <RegisteredField register={register} errors={errors}
            label="Website Status"
            name="websiteStatus"
            placeholder="Active / Inactive"
          />

          <RegisteredField register={register} errors={errors}
            label="HTTPS"
            name="https"
            placeholder="Yes / No"
          />

          <RegisteredField register={register} errors={errors}
            label="Mobile Responsive"
            name="mobileResponsive"
            placeholder="Yes / No"
          />

          <RegisteredField register={register} errors={errors}
            label="Page Speed"
            name="pageSpeed"
            placeholder="85 / Good"
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium">
            Outdated Indicators
          </label>

          <textarea
            {...register("outdatedIndicators")}
            rows={3}
            placeholder="Old design, outdated content, broken links..."
            className={inputClass}
          />
        </div>
      </div>

      {/* ================= GOOGLE INFORMATION ================= */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>
          Google Information
        </h3>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <RegisteredField register={register} errors={errors}
            label="Lead Score"
            name="leadScore"
            type="number"
            placeholder="75"
            step="0.01"
          />

          <RegisteredField register={register} errors={errors}
            label="Google Rating"
            name="googleRating"
            type="number"
            placeholder="4.5"
            min="0"
            max="5"
            step="0.01"
          />

          <RegisteredField register={register} errors={errors}
            label="Google Review Count"
            name="googleReviewCount"
            type="number"
            placeholder="125"
          />

          <RegisteredField register={register} errors={errors}
            label="Google Reviews URL"
            name="googleReviewsUrl"
            type="url"
            placeholder="https://google.com/..."
          />

          <RegisteredField register={register} errors={errors}
            label="Google Maps URL"
            name="googleMapsUrl"
            type="url"
            placeholder="https://maps.google.com/..."
          />
        </div>
      </div>

      {/* ================= REVIEW & IMAGES ================= */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Review Intelligence & Images</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Current Review Sentiment</label>
            <Controller name="reviewSentiment" control={control} render={({field})=><SelectField {...field} placeholder="Not classified" options={[{value:'',label:'Not classified'},{value:'bad',label:'Bad / Needs attention'},{value:'neutral',label:'Neutral'},{value:'good',label:'Good'}]}/>}/>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium">Current / Important Review</label>
            <textarea {...register("currentReview")} rows={3} placeholder="Latest or most important customer review; prioritize negative feedback." className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium">Multiple Image URLs</label>
            <textarea {...register("imageUrlsText")} rows={4} placeholder="One URL per line, or comma-separated URLs" className={inputClass} />
            <p className="mt-1 text-xs text-slate-500">Excel/API image aliases also populate this multi-image collection automatically.</p>
          </div>
        </div>
      </div>

      {/* ================= SOCIAL MEDIA ================= */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>
          Social Media
        </h3>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <RegisteredField register={register} errors={errors}
            label="Facebook"
            name="facebook"
            type="url"
            placeholder="Facebook URL"
          />

          <RegisteredField register={register} errors={errors}
            label="Instagram"
            name="instagram"
            type="url"
            placeholder="Instagram URL"
          />

          <RegisteredField register={register} errors={errors}
            label="LinkedIn"
            name="linkedin"
            type="url"
            placeholder="LinkedIn URL"
          />

          <RegisteredField register={register} errors={errors}
            label="YouTube"
            name="youtube"
            type="url"
            placeholder="YouTube URL"
          />

          <RegisteredField register={register} errors={errors}
            label="Social Media Found"
            name="socialMediaFound"
            placeholder="Yes / No"
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium">
            Social Media Links
          </label>

          <textarea
            {...register("socialMediaLinks")}
            rows={3}
            placeholder="Additional social media links"
            className={inputClass}
          />
        </div>
      </div>

      {/* ================= EMAIL INFORMATION ================= */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>
          Email Information
        </h3>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <RegisteredField register={register} errors={errors}
            label="Email Count"
            name="emailCount"
            type="number"
            placeholder="3"
          />

          <RegisteredField register={register} errors={errors}
            label="Email Source"
            name="emailSource"
            placeholder="Website / Google / LinkedIn"
          />

          <RegisteredField register={register} errors={errors}
            label="Email Type"
            name="emailType"
            placeholder="Business / Personal"
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium">
            All Emails
          </label>

          <textarea
            {...register("allEmails")}
            rows={3}
            placeholder="email1@example.com, email2@example.com"
            className={inputClass}
          />
        </div>
      </div>

      {/* ================= OTHER INFORMATION ================= */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>
          Other Information
        </h3>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <RegisteredField register={register} errors={errors}
            label="Image URL"
            name="imageUrl"
            type="url"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium">
            Top Comments
          </label>

          <textarea
            {...register("topComments")}
            rows={4}
            placeholder="Important notes or comments about this lead"
            className={inputClass}
          />
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="
            rounded-xl border border-slate-200
            px-5 py-2.5 text-sm font-medium
            hover:bg-slate-100
            dark:border-slate-700
            dark:hover:bg-slate-800
          "
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="
            rounded-xl bg-indigo-600
            px-5 py-2.5 text-sm font-semibold text-white
            hover:bg-indigo-700
            disabled:opacity-60
          "
        >
          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Update Lead"
              : "Add Lead"}
        </button>
      </div>
    </form>
  );
}

export default LeadForm;