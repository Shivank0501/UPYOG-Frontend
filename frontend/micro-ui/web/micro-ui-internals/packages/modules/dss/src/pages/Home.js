import {
  Card,
  CardHeader,
  DownloadIcon,
  EmailIcon,
  Header,
  Loader,
  MultiLink,
  Poll,
  Rating,
  ShareIcon,
  WhatsappIcon,
} from "@egovernments/digit-ui-react-components";
import { format } from "date-fns";
import React, { useMemo, useRef, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import FilterContext from "../components/FilterContext";
import { ArrowUpwardElement } from "../components/ArrowUpward";
import { ArrowDownwardElement } from "../components/ArrowDownward";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,Line,ComposedChart } from "recharts";
import { Icon } from "../components/common/Icon";
import MapChart from "../components/MapChart";
import MapDrillChart from "../components/mapDrillDownTable";
import NoData from "../components/NoData";
import { ReactComponent as Arrow_Right } from "../images/Arrow_Right.svg";
import { ReactComponent as Arrow_Right_White } from "../images/Arrow_Right_white.svg";
import { checkCurrentScreen } from "../components/DSSCard";

const key = "DSS_FILTERS";
const getInitialRange = () => {
  const data = Digit.SessionStorage.get(key);
  const startDate = data?.range?.startDate ? new Date(data?.range?.startDate) : Digit.Utils.dss.getDefaultFinacialYear().startDate;
  const endDate = data?.range?.endDate ? new Date(data?.range?.endDate) : Digit.Utils.dss.getDefaultFinacialYear().endDate;
  const title = `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
  const interval = Digit.Utils.dss.getDuration(startDate, endDate);
  const denomination = data?.denomination || "Lac";
  const tenantId = data?.filters?.tenantId || [];
  return { startDate, endDate, title, interval, denomination, tenantId };
};
const colors = [
  { dark: "rgba(12, 157, 149, 0.85)", light: "rgba(11, 222, 133, 0.14)", defaultColor: "rgba(244, 119, 56, 1)"},
  { dark: "rgba(251, 192, 45, 0.85)", light: "rgba(255, 202, 69, 0.24)", defaultColor: "rgba(244, 119, 56, 1)" },
  { dark: "rgba(75, 31, 165, 0.85)", light: "rgba(138, 83, 255, 0.24)", defaultColor: "rgba(244, 119, 56, 1)" },
  { dark: "rgba(4, 139, 208, 0.85)", light: "rgba(4, 139, 208, 0.24)", defaultColor: "rgba(244, 119, 56, 1)" },
  { dark: "rgba(239, 124, 91, 0.85)", light: "rgba(255, 114, 69, 0.24)", defaultColor: "rgba(244, 119, 56, 1)" },
  { dark: "rgba(81, 210, 198, 0.85)", light: "rgba(83, 255, 234, 0.14)", defaultColor: "rgba(244, 119, 56, 1)" },
  { dark: "rgba(183, 165, 69, 0.85)", light: "rgba(222, 188, 11, 0.24)", defaultColor: "rgba(244, 119, 56, 1)" },
  { dark: "rgba(110, 132, 89, 1)", light: "rgba(159, 255, 83, 0.24)", defaultColor: "rgba(244, 119, 56, 1)" },
  { dark: "rgba(120, 120, 120, 0.85)", light: "rgb(120,120,120,0.35)", defaultColor: "rgba(244, 119, 56, 1)" },
  { dark: "rgba(183, 165, 69, 0.85)", light: "rgba(222, 188, 11, 0.24)", defaultColor: "rgba(244, 119, 56, 1)" },
  { dark: "rgba(183, 165, 69, 0.85)", light: "rgba(222, 188, 11, 0.24)", defaultColor: "rgba(244, 119, 56, 1)" },
];

const Chart = ({ data, moduleLevel, overview = false }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { id, chartType } = data;
  const { startDate, endDate, interval } = getInitialRange();
  const requestDate = {
    startDate: startDate.getTime(),
    endDate: endDate.getTime(),
    interval: interval,
    title: "home",
  };

  const { isLoading, data: response } = Digit.Hooks.dss.useGetChart({
    key: id,
    type: chartType,
    tenantId,
    requestDate,
    moduleLevel: moduleLevel,
  });

  if (isLoading) {
    return <Loader />;
  }
  
  console.log("response",response)
  if(response?.responseData?.data?.[0]?.headerName === "DSS_STATE_GDP_REVENUE_COLLECTION" )
  {
    console.log("responseData",response)
    response.responseData.data[0].headerValue = response.responseData.data[0].headerValue * 100
  }
  

  const insight = response?.responseData?.data?.[0]?.insight?.value?.replace(/[+-]/g, "")?.split("%");
  return (
    <div className={"dss-insight-card"} style={overview ? {} : { margin: "0px" }}>
      <div className={`tooltip`}>
        <p className="p1">{t(data?.name)}</p>
        <span
          className="tooltiptext"
          style={{
            width: t(`TIP_${data.name}`).length < 40 ? "max-content" : "fit-content",
            height: t(`TIP_${data.name}`).length < 40 ? "fit-content" : "max-content",
            whiteSpace: "normal",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: "400px", color: "white" }}>{t(`TIP_${data.name}`)}</span>
        </span>
      </div>
      {data.name === "NATIONAL_DSS_OVERVIEW_CITIZEN_FEEDBACK_SCORE" ? 
      <Rating
          //id={response?.responseData?.data?.[0]?.headerValue}
          currentRating={Math.round(response?.responseData?.data?.[0]?.headerValue * 10) / 10}
          styles={{ width: "unset", marginBottom: 0 }}
          starStyles={{ width: "25px" }}
          toolTipText={t("COMMON_RATING_LABEL")}
      />
              :<p className="p2">

        {response?.responseData?.data?.[0]?.headerName == "NATIONAL_DSS_TOTAL_COLLECTION" ? Digit.Utils.dss.formatter(response?.responseData?.data?.[0]?.headerValue, response?.responseData?.data?.[0]?.headerSymbol, "Cr", true, t): response?.responseData?.data?.[0]?.headerName ==  "NATIONAL_DSS_TARGET_COLLECTION"? Digit.Utils.dss.formatter(response?.responseData?.data?.[0]?.headerValue, response?.responseData?.data?.[0]?.headerSymbol, "Cr", true, t): response?.responseData?.data?.[0]?.headerName == "DSS_NON_TAX_REVENUE_PER_HOUSEHOLD"? Digit.Utils.dss.formatter(response?.responseData?.data?.[0]?.headerValue, response?.responseData?.data?.[0]?.headerSymbol, "Unit", true, t): response?.responseData?.data?.[0]?.headerName == "PropertyTaxRevenuePerHouseholdOverview" ? Digit.Utils.dss.formatter(response?.responseData?.data?.[0]?.headerValue, response?.responseData?.data?.[0]?.headerSymbol, "Unit", true, t): response?.responseData?.data?.[0]?.headerName == "DSS_STATE_GDP_REVENUE_COLLECTION"  ? Digit.Utils.dss.formatter(response?.responseData?.data?.[0]?.headerValue, response?.responseData?.data?.[0]?.headerSymbol, "UnitGDP", true, t): Digit.Utils.dss.formatter(response?.responseData?.data?.[0]?.headerValue, response?.responseData?.data?.[0]?.headerSymbol, "Unit", true, t)}
      </p>}
      {response?.responseData?.data?.[0]?.insight?.value ? (
        <p className={`p3 ${response?.responseData?.data?.[0]?.insight?.indicator === "upper_green" ? "color-green" : "color-red"}`}>
          {response?.responseData?.data?.[0]?.insight?.indicator === "upper_green" ? ArrowUpwardElement("10px") : ArrowDownwardElement("10px")}
          {insight?.[0] && `${insight[0]}% ${t(Digit.Utils.locale.getTransformedLocale("DSS" + insight?.[1] || ""))}`}
        </p>
      ) : null}
    </div>
  );
};

const HorBarChart = ({ data, setselectState = "" }) => {
  const barColors = ["#298CFF", "#54D140"];
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { id, chartType } = data;
  let filters = {};

  if (setselectState !== "") filters.state = setselectState;

  filters = { ...filters };
  const { startDate, endDate, interval } = getInitialRange();
  const requestDate = {
    startDate: startDate.getTime(),
    endDate: endDate.getTime(),
    interval: interval,
    title: "home",
  };

  const { isLoading, data: response } = Digit.Hooks.dss.useGetChart({
    key: id,
    type: chartType,
    tenantId,
    requestDate,
    filters: filters,
  });

  const constructChartData = (data) => {
    const currencyFormatter = new Intl.NumberFormat("en-IN", { currency: "INR" });
    // console.log("data: ",data)
    // let index = data?.findIndex(x => x.headerName == "liveUlbsCount");

    // console.log(index)
    // data?.splice(index, 1)
    var date = new Date();
            var months = [],
                monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
            for(var i = 0; i < 12; i++) {
                months.push(monthNames[date.getMonth()] + '-' + date.getFullYear());
                date.setMonth(date.getMonth() - 1);
            }    
            console.log("months",months,data);

    let result = {};
    for (let i = 0; i < data?.length; i++) {
      const row = data[i];
      for (let j = 0; j < row.plots.length; j++) {
        const plot = row.plots[j];
        if(months.includes(plot?.name))
        {
         
          if(plot?.value >10000)
          {
            result[plot.name] = { ...result[plot.name], [t(row.headerName)]:currencyFormatter.format((plot?.value / 10000000).toFixed(2) || 0), name: t(plot.name) };      
          }
          else {
            result[plot.name] = { ...result[plot.name], [t(row.headerName)]:plot?.value , name: t(plot.name) }; 
          }
        }
     
       
      }
    }   
    return Object.keys(result).map((key) => {      
      return {
        name: key,
        ...result[key],
      };
    });
  };
//   const renderLegend = (value) =>
// (<span style={{ fontSize: "14px", color: "#505A5F" }}>{t(`DSS_${Digit.Utils.locale.getTransformedLocale(value)}`)} (Cr)</span>);
const renderLegend = (value) => {

  return (
    <li style={{display:"contents"}}>
      {
        value == "TotalCollection"?
          <span style={{ fontSize: "14px", color: "#505A5F" }}>{t(`DSS_${Digit.Utils.locale.getTransformedLocale(value)}`)}(Cr)</span>:<span style={{ fontSize: "14px", color: "#505A5F" }}>{t(`DSS_${Digit.Utils.locale.getTransformedLocale(value)}`)}</span>
        
      }
    </li>
  )
}
  const chartData = useMemo(() => constructChartData(response?.responseData?.data));
  const tooltipFormatter = (value, name) => {
    return name == "TotalCollection"?`${value} Cr`:`${value}`

  };
  if (isLoading) {
    return <Loader />;
  }

  const bars = response?.responseData?.data?.map((bar) => bar?.headerName);

  return (
    <ResponsiveContainer
      width="60%"
      height={480}
      margin={{
        top: 5,
        right: 5,
        left: 5,
        bottom: 5,
      }}
    >
      {chartData?.length === 0 || !chartData ? (
        <NoData t={t} />
      ) : (
          <ComposedChart
            width="100%"
            height="100%"
            margin={{
              top: 5,
              right: 5,
              left: 5,
              bottom: 5,
            }}
            data={chartData}
          >
            <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" />
            <XAxis dataKey={"name"} type={"category"} tick={{ fontSize: "14px", fill: "#505A5F" }} tickCount={12} />
            <YAxis yAxisId="left"  type={"number"} orientation="left" stroke="#54d140" tickCount={10} domain={[0, 300]}/>
            <YAxis yAxisId="right" type={"number"} orientation="right" stroke="#a82227" tickCount={10} />
            <Tooltip cursor={false} formatter={tooltipFormatter}/>
             <Legend formatter={renderLegend} iconType="circle" />
            <Bar yAxisId="left" dataKey="TotalCollection" fill="#54d140" />
            <Line yAxisId="right" type="monotone" dataKey="liveUlbsCount" stroke="#a82227" />
          </ComposedChart>
      )}
    </ResponsiveContainer>
  );
};

const Home = ({ stateCode }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { t } = useTranslation();
  const [filters, setFilters] = useState(() => {});
  const { moduleCode } = useParams();
  const language = Digit.StoreData.getCurrentLanguage();
  const { isLoading: localizationLoading, data: store } = Digit.Services.useStore({ stateCode, moduleCode, language });
  const { data: response, isLoading } = Digit.Hooks.dss.useDashboardConfig(moduleCode);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedState, setselectedState] = useState("");
  const [drillDownId, setdrillDownId] = useState("none");
  const [totalCount, setTotalCount] = useState("");
  const [liveCount, setLiveCount] = useState("");

  const isLandingPage = window.location.href.includes("/dss/landing/home") || window.location.href.includes("dss/landing/NURT_DASHBOARD");

  const handleFilters = (data) => {
    Digit.SessionStorage.set(key, data);
    setFilters(data);
  };
  function routeTo(jumpTo) {
    location.href = jumpTo;
  }
  const fullPageRef = useRef();
  const provided = useMemo(
    () => ({
      value: filters,
      setValue: handleFilters,
    }),
    [filters]
  );

  const mobileView = innerWidth <= 640;

  const handlePrint = () => Digit.Download.PDF(fullPageRef, t(dashboardConfig?.[0]?.name));

  const dashboardConfig = response?.responseData;

  const shareOptions = navigator.share
    ? [
        {
          label: t("ES_DSS_SHARE_PDF"),
          onClick: () => {
            setShowOptions(!showOptions);
            setTimeout(() => {
              return Digit.ShareFiles.PDF(tenantId, fullPageRef, t(dashboardConfig?.[0]?.name));
            }, 500);
          },
        },
        {
          label: t("ES_DSS_SHARE_IMAGE"),
          onClick: () => {
            setShowOptions(!showOptions);
            setTimeout(() => {
              return Digit.ShareFiles.Image(tenantId, fullPageRef, t(dashboardConfig?.[0]?.name));
            }, 500);
          },
        },
      ]
    : [
        {
          icon: <EmailIcon />,
          label: t("ES_DSS_SHARE_PDF"),
          onClick: () => {
            setShowOptions(!showOptions);
            setTimeout(() => {
              return Digit.ShareFiles.PDF(tenantId, fullPageRef, t(dashboardConfig?.[0]?.name), "mail");
            }, 500);
          },
        },
        {
          icon: <WhatsappIcon />,
          label: t("ES_DSS_SHARE_PDF"),
          onClick: () => {
            setShowOptions(!showOptions);
            setTimeout(() => {
              return Digit.ShareFiles.PDF(tenantId, fullPageRef, t(dashboardConfig?.[0]?.name), "whatsapp");
            }, 500);
          },
        },
        {
          icon: <EmailIcon />,
          label: t("ES_DSS_SHARE_IMAGE"),
          onClick: () => {
            setShowOptions(!showOptions);
            setTimeout(() => {
              return Digit.ShareFiles.Image(tenantId, fullPageRef, t(dashboardConfig?.[0]?.name), "mail");
            }, 500);
          },
        },
        {
          icon: <WhatsappIcon />,
          label: t("ES_DSS_SHARE_IMAGE"),
          onClick: () => {
            setShowOptions(!showOptions);
            setTimeout(() => {
              return Digit.ShareFiles.Image(tenantId, fullPageRef, t(dashboardConfig?.[0]?.name), "whatsapp");
            }, 500);
          },
        },
      ];

  if (isLoading || localizationLoading) {
    return <Loader />;
  }

  return (
    <FilterContext.Provider value={provided}>
      <div ref={fullPageRef}>
        <div className="options" style={{ margin: "10px" }}>
          <Header styles={{ marginBottom: "0px" }}>{t(dashboardConfig?.[0]?.name)}</Header>
          {mobileView ? null : (
            <div>
              <div className="mrlg">
                <MultiLink
                  className="multilink-block-wrapper"
                  label={t(`ES_DSS_SHARE`)}
                  icon={<ShareIcon className="mrsm" />}
                  showOptions={(e) => setShowOptions(e)}
                  onHeadClick={(e) => setShowOptions(e !== undefined ? e : !showOptions)}
                  displayOptions={showOptions}
                  options={shareOptions}
                />
              </div>
              <div className="mrsm" onClick={handlePrint}>
                <DownloadIcon className="mrsm" />
                {t(`ES_DSS_DOWNLOAD`)}
              </div>
            </div>
          )}
        </div>

        {mobileView ? (
          <div className="options-m">
            <div>
              <MultiLink
                className="multilink-block-wrapper"
                label={t(`ES_DSS_SHARE`)}
                icon={<ShareIcon className="mrsm" />}
                showOptions={(e) => setShowOptions(e)}
                onHeadClick={(e) => setShowOptions(e !== undefined ? e : !showOptions)}
                displayOptions={showOptions}
                options={shareOptions}
              />
            </div>
            <div onClick={handlePrint}>
              <DownloadIcon />
              {t(`ES_DSS_DOWNLOAD`)}
            </div>
          </div>
        ) : null}
        {dashboardConfig?.[0]?.visualizations.map((row, key) => {
          console.log("visualizations",row,key)
          return (
            <div className="dss-card" key={key}>
              {row.vizArray.map((item, index) => {
                if (item?.charts?.[0]?.chartType == "bar") {
                  return null;
                } else if (item?.charts?.[0]?.chartType == "map") {
                  return (
                    <div
                      className={`dss-card-parent  ${
                        item.vizType == "collection"
                          ? "w-100"
                          : item.name.includes("PROJECT_STAUS") || item.name.includes("LIVE_ACTIVE_ULBS")
                          ? "dss-h-100"
                          : ""
                      }`}
                      style={item.vizType == "collection" ? { backgroundColor: "#fff", height: "600px" } : { backgroundColor: colors[index].light }}
                      key={index}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <div className="dss-card-header">
                          {Icon(item.name)}
                          <p style={{ marginLeft: "20px" }}>
                            {selectedState === "" ? t(item.name) : t(`DSS_TB_${Digit.Utils.locale.getTransformedLocale(selectedState)}`)}
                          </p>
                          {selectedState != "" && item.name.includes("PROJECT_STAUS") && (
                            <span style={{ fontSize: "14px", display: "block" }}>
                              {t(`DSS_TOTAL_ULBS`)} {Number(totalCount).toFixed()} | {t(`DSS_LIVE_ULBS`)} {Number(liveCount).toFixed()}
                            </span>
                          )}
                        </div>
                        {item?.charts?.[0]?.chartType == "map" && (
                          <div className="dss-card-header" style={{ width: "60%" }}>
                            {Icon(row.vizArray?.[1]?.name)}
                            <p style={{ marginLeft: "20px", fontSize: "24px", fontFamily: "Roboto, sans-serif", fontWeight: 500, color: "#000000" }}>
                              {selectedState === ""
                                ? t(row.vizArray?.[1]?.name)
                                : t(`${Digit.Utils.locale.getTransformedLocale(selectedState)}_${row.vizArray?.[1]?.name}`)}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="dss-card-body">
                        {item?.charts?.[0]?.chartType == "map" &&
                          (selectedState != "" ? (
                            <MapDrillChart
                              data={item?.charts?.[0]}
                              selectedState={selectedState}
                              setselectedState={setselectedState}
                              drilldownId={drillDownId}
                              setdrilldownId={setdrillDownId}
                              setTotalCount={setTotalCount}
                              setLiveCount={setLiveCount}
                            />
                          ) : (
                            <MapChart
                              data={item?.charts?.[0]}
                              setselectedState={setselectedState}
                              setdrilldownId={setdrillDownId}
                              settotalCount={setTotalCount}
                              setliveCount={setLiveCount}
                            />
                          ))}
                        {item?.charts?.[0]?.chartType == "map" && (
                          <HorBarChart data={row.vizArray?.[1]?.charts?.[0]} setselectState={selectedState}></HorBarChart>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      className={`dss-card-parent  ${
                        item.vizType == "collection"
                          ? "dss-w-100"
                          : item.name.includes("PROJECT_STAUS") || item.name.includes("LIVE_ACTIVE_ULBS")
                          ? "h-100"
                          : ""
                      }`}
                      style={
                        item.vizType == "collection" || item.name.includes("PROJECT_STAUS") || item.name.includes("LIVE_ACTIVE_ULBS")
                          ? { backgroundColor: "#fff", position: "relative" }
                          : { backgroundColor: colors[index].light, padding: "20px", paddingBottom: "40px", position: "relative" }
                      }
                      key={index}
                      // onClick={() => routeTo(`/digit-ui/employee/dss/dashboard/${item.ref.url}`)}
                    >
                      <div style={{ justifyContent: "space-between", display: "flex", flexDirection: "row" }}>
                        <div className="dss-card-header" style={{ marginBottom: "10px" }}>
                          {Icon(item.name, colors[index].dark)}
                          <p style={{ marginLeft: "20px" }}>{t(item.name)}</p>
                        </div>
                        {item.vizType == "collection" ? (
                          <div
                            style={{
                              float: "right",
                              textAlign: "right",
                              color: "#a82227",
                              fontSize: 16,
                              fontWeight: "bold",
                              display: "flex",
                              flexDirection: "row",
                            }}
                          >
                            {!isLandingPage && <span><span style={{ paddingRight: 10 }}>{t("DSS_OVERVIEW")}</span>
                              <span>
                                {" "}
                                <Arrow_Right />
                              </span></span>}
                          </div>
                        ) : null}
                      </div>

                      <div className="dss-card-body" style={{marginBottom: isLandingPage ? "20px" : ""}}>
                        {item.charts.map((chart, key) => (
                          <div style={item.vizType == "collection" ? { width: Digit.Utils.browser.isMobile() ? "50%" : "25%" } : { width: "50%" }}>
                            <Chart data={chart} key={key} moduleLevel={item.moduleLevel} overview={item.vizType === "collection"} />
                          </div>
                        ))}
                      </div>
                      {isLandingPage && <div
                        style={{ borderRadius: "0px 0px 4px 4px", position: "absolute", display: "flex", justifyContent: "center", alignItems: "center", bottom: "0px", left: "0px", width: "100%", background: item.vizType == "collection" || item.name.includes("PROJECT_STAUS") || item.name.includes("LIVE_ACTIVE_ULBS") ? colors?.[index]?.defaultColor : colors?.[index]?.dark }}
                        onClick={() => routeTo(`/digit-ui/employee/dss/dashboard/${item.ref.url}`)}
                      >
                        <div style={{ padding: "10px", display: "flex", justifyContent: "center", alignItems: "center", height: "40px" }}>
                          <span style={{ marginRight: "10px", color: "white" }}>
                            {`${t("COMMON_DSS_VIEW_DASH_BOARD_LABEL")} `}
                          </span>
                          <Arrow_Right_White />
                        </div>
                      </div>}
                    </div>
                  );
                }
              })}
            </div>
          );
        })}
      </div>
    </FilterContext.Provider>
  );
};

export default Home;