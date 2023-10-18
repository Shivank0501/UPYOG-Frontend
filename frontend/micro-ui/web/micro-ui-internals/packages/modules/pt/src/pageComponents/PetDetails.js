import {
    CardLabel,
    CardLabelError,
    Dropdown,
    LabelFieldPair,
    LinkButton,
    //MobileNumber,
    TextInput,
    Toast,
  } from "@egovernments/digit-ui-react-components";
  import _ from "lodash";
  import React, { useEffect, useMemo, useState } from "react";
  import { Controller, useForm } from "react-hook-form";
  import { useTranslation } from "react-i18next";
  import { useLocation } from "react-router-dom";
  import { stringReplaceAll, CompareTwoObjects } from "../utils";
  
  const createPtrrDetails = () => ({
    name: "",
    //doctormobileNumber: "",
    doctorName: "",
    //doctoremailId: "",
    datee: "",
    //permanentAddress: "",
    age: "",
    //relationship: "",
    pettype: "",
    breedType:"",
    ownerType: "",
    clinicName:"",
    //gender: "",
    petname: "",
    sex: "",
    //isCorrespondenceAddress: false,
    key: Date.now(),
  });
  
  const PetDetails = ({ config, onSelect, userType, formData, setError, formState, clearErrors }) => {
    const { t } = useTranslation();
  
    const { pathname } = useLocation();
    const isEditScreen = pathname.includes("/modify-application/");
    const [owners, setOwners] = useState(formData?.owners || [createPtrrDetails()]);
    const [focusIndex, setFocusIndex] = useState({ index: -1, type: "" });
  
    const tenantId = Digit.ULBService.getCurrentTenantId();
    const stateId = Digit.ULBService.getStateId();
    const { data: mdmsData, isLoading } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", [
      // "UsageCategory",
      // "OccupancyType",
      //"Floor",
      "OwnerType",
      //"OwnerShipCategory",
      // "Documents",
      // "SubOwnerShipCategory",
      // "OwnerShipCategory",
    ]);
  
    const { data: Menu } = Digit.Hooks.pt.usePTGenderMDMS(stateId, "common-masters", "GenderType");
  
    let menu = [];
  
    Menu &&
      Menu.map((formGender) => {
        menu.push({ i18nKey: `PT_FORM3_${formGender.code}`, code: `${formGender.code}`, value: `${formGender.code}` });
      });
  
    const addNewOwner = () => {
      const newOwner = createPtrrDetails();
      setOwners((prev) => [...prev, newOwner]);
    };
  
    const removeOwner = (owner) => {
      setOwners((prev) => prev.filter((o) => o.key != owner.key));
    };
  
    useEffect(() => {
      onSelect(config?.key, owners);
    }, [owners]);
  
    const commonProps = {
      focusIndex,
      allOwners: owners,
      setFocusIndex,
      removeOwner,
      formData,
      formState,
      setOwners,
      mdmsData,
      t,
      setError,
      clearErrors,
      config,
      menu,
      isEditScreen,
    };
  
    return formData?.ownershipCategory?.code ? (
      <React.Fragment>
        {owners.map((owner, index) => (
          <OwnerForm key={owner.key} index={index} owner={owner} {...commonProps} />
        ))}
        {!isEditScreen && formData?.ownershipCategory?.code === "INDIVIDUAL.MULTIPLEOWNERS" ? (
          <LinkButton label="Add Owner" onClick={addNewOwner} style={{ color: "orange" }} />
        ) : null}
      </React.Fragment>
    ) : null;
  };
  
  const OwnerForm = (_props) => {
    const {
      owner,
      index,
      focusIndex,
      allOwners,
      setFocusIndex,
      removeOwner,
      setOwners,
      t,
      mdmsData,
      formData,
      config,
      setError,
      clearErrors,
      formState,
      menu,
      isEditScreen,
    } = _props;
    const { originalData = {} } = formData;
    const { institution = {} } = originalData;
    const [uuid, setUuid] = useState(null);
    const [showToast, setShowToast] = useState(null);
    const {
      control,
      formState: localFormState,
      watch,
      setError: setLocalError,
      clearErrors: clearLocalErrors,
      setValue,
      trigger,
    } = useForm();
    const formValue = watch();
    const { errors } = localFormState;
    const tenantId = Digit.ULBService.getCurrentTenantId();
  
    const isIndividualTypeOwner = useMemo(
      () => formData?.ownershipCategory?.code.includes("INDIVIDUAL"),
      [formData?.ownershipCategory?.code],
    );
  
    const [part, setPart] = React.useState({});
  
    useEffect(() => {
      let _ownerType = isIndividualTypeOwner ? {} : { ownerType: { code: "NONE" } };
  
      if (!_.isEqual(part, formValue)) {
        setPart({ ...formValue });
        setOwners((prev) => prev.map((o) => (o.key && o.key === owner.key ? { ...o, ...formValue, ..._ownerType } : { ...o })));
        trigger();
      }
    }, [formValue]);
  
    useEffect(() => {
      if (Object.keys(errors).length && !_.isEqual(formState.errors[config.key]?.type || {}, errors))
        setError(config.key, { type: errors });
      else if (!Object.keys(errors).length && formState.errors[config.key]) clearErrors(config.key);
    }, [errors]);
  
    const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };
  
    return (
      <React.Fragment>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ border: "1px solid #E3E3E3", padding: "16px", marginTop: "8px" }}>
            {allOwners?.length > 2 ? (
              <div
                onClick={() => removeOwner(owner)}
                style={{ marginBottom: "16px", padding: "5px", cursor: "pointer", textAlign: "right" }}
              >
                X
              </div>
            ) : null}
  
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{t("PTR_PET_TYPE ") + " *"}</CardLabel>
              <Controller
                control={control}
                name={"pettype"}
                defaultValue={owner?.pettype}
                rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    selected={props.value}
                    select={props.onChange}
                    onBlur={props.onBlur}
                    disable={isEditScreen}
                    option={[
                      // { i18nKey: "PT_FORM3_FATHER", code: "FATHER" },
                      // { i18nKey: "PT_FORM3_HUSBAND", code: "HUSBAND" },
                      { i18nKey: "PTR_DOG", code: "DOG" }, // set the location accordingly
                      { i18nKey: "PTR_CAT", code: "CAT" },
                    ]}
                    optionKey="i18nKey"
                    t={t}
                  />
                )}
              />
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>{localFormState.touched.pettype ? errors?.pettype?.message : ""}</CardLabelError>

            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{t("PTR_BREED_TYPE") + " *"}</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name={"breedType"}
                  defaultValue={owner?.breedType}
                  rules={{
                    required: t("CORE_COMMON_REQUIRED_ERRMSG"),
                    validate: { pattern: (val) => (/^[a-zA-Z\s]*$/.test(val) ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")) },
                  }}
                  render={(props) => (
                    <TextInput
                      value={props.value}
                      disable={isEditScreen}
                      autoFocus={focusIndex.index === owner?.key && focusIndex.type === "breedType"}
                      onChange={(e) => {
                        props.onChange(e.target.value);
                        setFocusIndex({ index: owner.key, type: "breedType" });
                      }}
                      onBlur={(e) => {
                        setFocusIndex({ index: -1 });
                        props.onBlur(e);
                      }}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>{localFormState.touched.breedType ? errors?.breedType?.message : ""}</CardLabelError>
  
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{t("PTR_PET_NAME") + " *"}</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name={"petname"}
                  defaultValue={owner?.petname}
                  rules={{
                    required: t("CORE_COMMON_REQUIRED_ERRMSG"),
                    validate: { pattern: (val) => (/^[a-zA-Z\s]*$/.test(val) ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")) },
                  }}
                  render={(props) => (
                    <TextInput
                      value={props.value}
                      disable={isEditScreen}
                      autoFocus={focusIndex.index === owner?.key && focusIndex.type === "petname"}
                      onChange={(e) => {
                        props.onChange(e.target.value);
                        setFocusIndex({ index: owner.key, type: "petname" });
                      }}
                      onBlur={(e) => {
                        setFocusIndex({ index: -1 });
                        props.onBlur(e);
                      }}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>{localFormState.touched.petname ? errors?.petname?.message : ""}</CardLabelError>
  
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{t("PTR_PET_AGE") + " *"}</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name={"age"}
                  defaultValue={owner?.age}
                  rules={{
                    required: t("CORE_COMMON_REQUIRED_ERRMSG"),
                    validate: (v) => (/^[0-1-2-3]\d{1,2}$/.test(v) ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")),
                  }}
                  render={(props) => (
                    <TextInput
                      value={props.value}
                      disable={isEditScreen}
                      autoFocus={focusIndex.index === owner?.key && focusIndex.type === "age"}
                      onChange={(e) => {
                        props.onChange(e);
                        setFocusIndex({ index: owner.key, type: "age" });
                      }}
                      labelStyle={{ marginTop: "unset" }}
                      onBlur={props.onBlur}
                      placeholder="in years"
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>{localFormState.touched.age ? errors?.age?.message : ""}</CardLabelError>
  
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{t("PTR_SEX ") + " *"}</CardLabel>
              <Controller
                control={control}
                name={"sex"}
                defaultValue={owner?.sex}
                rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    selected={props.value}
                    select={props.onChange}
                    onBlur={props.onBlur}
                    disable={isEditScreen}
                    option={[
                      // { i18nKey: "PT_FORM3_FATHER", code: "FATHER" },
                      // { i18nKey: "PT_FORM3_HUSBAND", code: "HUSBAND" },
                      { i18nKey: "PTR_MALE", code: "MALE" }, // set the localization accordingly
                      { i18nKey: "PTR_FEMALE", code: "FEMALE" },
                    ]}
                    optionKey="i18nKey"
                    t={t}
                  />
                )}
              />
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>{localFormState.touched.sex ? errors?.sex?.message : ""}</CardLabelError>
  
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{t("PTR_DOCTOR_NAME") + " *"}</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name={"doctorName"}
                  defaultValue={owner?.doctorName}
                  rules={{
                    required: t("CORE_COMMON_REQUIRED_ERRMSG"),
                    validate: { pattern: (val) => (/^\w+( +\w+)*$/.test(val) ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")) },
                  }}
                  render={(props) => (
                    <TextInput
                      value={props.value}
                      disable={isEditScreen}
                      autoFocus={focusIndex.index === owner?.key && focusIndex.type === "doctorName"}
                      onChange={(e) => {
                        props.onChange(e.target.value);
                        setFocusIndex({ index: owner.key, type: "doctorName" });
                      }}
                      onBlur={props.onBlur}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>
              {localFormState.touched.doctorName ? errors?.doctorName?.message : ""}
            </CardLabelError>
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{t("PTR_CLINIC_NAME") + " *"}</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name={"clinicName"}
                  defaultValue={owner?.clinicName}
                  rules={{
                    required: t("CORE_COMMON_REQUIRED_ERRMSG"),
                    validate: { pattern: (val) => (/^\w+( +\w+)*$/.test(val) ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")) },
                  }}
                  render={(props) => (
                    <TextInput
                      value={props.value}
                      disable={isEditScreen}
                      autoFocus={focusIndex.index === owner?.key && focusIndex.type === "clinicName"}
                      onChange={(e) => {
                        props.onChange(e.target.value);
                        setFocusIndex({ index: owner.key, type: "clinicName" });
                      }}
                      onBlur={props.onBlur}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>
              {localFormState.touched.clinicName ? errors?.clinicName?.message : ""}
            </CardLabelError>
  
           
  
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{t("PTR_PURCHASE_DATE") + " *"}</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name={"datee"}
                  defaultValue={owner?.datee}
                  rules={{
                    required: t("CORE_COMMON_REQUIRED_ERRMSG"),
                    validDate: (val) => (/^\d{4}-\d{2}-\d{2}$/.test(val) ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")),
                  }}
                  render={(props) => (
                    <TextInput
                        type="date"
                        value={props.value}
                        onChange={(e) => {
                            props.onChange(e.target.value);
                        }}
                        max={new Date().toISOString().split('T')[0]}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>{localFormState.touched.datee ? errors?.datee?.message : ""}</CardLabelError>
  
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{t("PTR_VACCINATED_DATE") + " *"}</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name={"datee"}
                  defaultValue={owner?.datee}
                  rules={{
                    required: t("CORE_COMMON_REQUIRED_ERRMSG"),
                    validDate: (val) => (/^\d{4}-\d{2}-\d{2}$/.test(val) ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")),
                  }}
                  render={(props) => (
                    <TextInput
                        type="date"
                        value={props.value}
                        onChange={(e) => {
                            props.onChange(e.target.value);
                        }}
                        max={new Date().toISOString().split('T')[0]}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>{localFormState.touched.datee ? errors?.datee?.message : ""}</CardLabelError>
          </div>
        </div>
        {showToast?.label && (
          <Toast
            label={showToast?.label}
            onClose={(w) => {
              setShowToast((x) => null);
            }}
          />
        )}
      </React.Fragment>
    );
  };
  
  export default PetDetails;
  