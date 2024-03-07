using System.Web.Mvc;
using AinsteinDemo.Models;
using AinsteinDemo.Services;
using Microsoft.Rest;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Ajax.Utilities;
using AinsteinDemo.ActionFilters;

namespace AinsteinDemo.Controllers
{
    [LogActionFilter]
    public class CompanyController : Controller
    {
        private string m_errorMessage;

        public CompanyController()
        {
            m_errorMessage = ConfigValidatorService.GetWebConfigErrors();
        }

        // GET: ETF | Index
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult ComingSoon(string id)
        {
            return View(new ReportEmbedConfig() { Ticker = id });
        }


        public async Task<ActionResult> Earnings(string id)
        {
            return await Details(id, "Earnings");
        }

        public async Task<ActionResult> Revenue(string id)
        {
            return await Details(id, "Revenue");
        }

        public async Task<ActionResult> CashFlow(string id)
        {
            return await Details(id, "Cash Flow");
        }

        public async Task<ActionResult> Details(string id, string bookmark)
        {
            if (!m_errorMessage.IsNullOrWhiteSpace())
            {
                return View("Error", BuildErrorModel(m_errorMessage));
            }

            try
            {
                var theReportList = new System.Collections.Generic.List<Guid>();
                if (bookmark == "Earnings")
                {
                    theReportList.Add(ConfigValidatorService.EarningsChartID);
                }
                else if (bookmark == "Revenue")
                {
                    theReportList.Add(ConfigValidatorService.RevenueChartID);
                }
                else if (bookmark == "Cash Flow")
                {
                    theReportList.Add(ConfigValidatorService.CashFlowChartID);
                }
                else
                {
                    theReportList.Add(ConfigValidatorService.CompanyDetailID);
                }
                var embedResult = await EmbedService.GetEmbedParams(ConfigValidatorService.WorkspaceId, theReportList[0]);
                embedResult.Ticker = id;
                embedResult.BookmarkDisplayName = bookmark;

                // Setup View Name if we call this action from another one
                return View("Details", embedResult);
            }
            catch (HttpOperationException exc)
            {
                m_errorMessage = string.Format("Status: {0} ({1})\r\nResponse: {2}\r\nRequestId: {3}", exc.Response.StatusCode, (int)exc.Response.StatusCode, exc.Response.Content, exc.Response.Headers["RequestId"].FirstOrDefault());
                return View("Error", m_errorMessage);
            }
            catch (Exception ex)
            {
                return View("Error", ex.Message);
            }


        }


        public async Task<ActionResult> Subindustry(int id)
        {
            if (!m_errorMessage.IsNullOrWhiteSpace())
            {
                return View("Error", BuildErrorModel(m_errorMessage));
            }

            try
            {
                System.Collections.Generic.IList<Guid> theReportList = new System.Collections.Generic.List<Guid>();
                theReportList.Add(ConfigValidatorService.SubindustryId);



                var embedResult = await EmbedService.GetEmbedParams(ConfigValidatorService.WorkspaceId, theReportList[0]);
                return View(embedResult);
            }
            catch (HttpOperationException exc)
            {
                m_errorMessage = string.Format("Status: {0} ({1})\r\nResponse: {2}\r\nRequestId: {3}", exc.Response.StatusCode, (int)exc.Response.StatusCode, exc.Response.Content, exc.Response.Headers["RequestId"].FirstOrDefault());
                return View("Error", m_errorMessage);
            }
            catch (Exception ex)
            {
                return View("Error", ex.Message);
            }


        }
        private ErrorModel BuildErrorModel(string errorMessage)
        {
            return new ErrorModel
            {
                ErrorMessage = errorMessage
            };
        }

    }
}
