using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using System.Web.Mvc;
using AinsteinDemo.Models;
using System.Web.Script.Serialization;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using static System.Net.Mime.MediaTypeNames;
using static System.Windows.Forms.VisualStyles.VisualStyleElement.TextBox;
using System.Drawing.Printing;
using System.Drawing;


namespace AinsteinDemo.Controllers
{
    public class APIController : Controller
    {
        private readonly string _connectionString;
        public APIController()
        {
            _connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["dbConnection"].ConnectionString;
        }

        [HttpGet]
        public JsonResult GetSearchResults(string searchText)
        {
            List<dynamic> ObjList = new List<dynamic>()
            {
                new {Id = "AAPL", Name = "APPLE, INC.", SecurityCode = "Stocks" },
                new {Id = "ABBV", Name = "ABBVIE, INC.", SecurityCode = "Stocks" },
                new {Id = "ABT", Name = "ABBOTT LABORATORIES", SecurityCode = "Stocks" },
                new {Id = "ACN", Name = "ACCENTURE PLC", SecurityCode = "Stocks" },
                new {Id = "ADBE", Name = "ADOBE, INC.", SecurityCode = "Stocks" },
                new {Id = "AMD", Name = "ADVANCED MICRO DEVICES, INC.", SecurityCode = "Stocks" },
                new {Id = "AMGN", Name = "AMGEN, INC.", SecurityCode = "Stocks" },
                new {Id = "AMZN", Name = "AMAZON.COM, INC.", SecurityCode = "Stocks" },
                new {Id = "AVGO", Name = "BROADCOM, INC.", SecurityCode = "Stocks" },
                new {Id = "BAC", Name = "BANK OF AMERICA CORP.", SecurityCode = "Stocks" },
                new {Id = "BMY", Name = "BRISTOL MYERS SQUIBB CO.", SecurityCode = "Stocks" },
                new {Id = "BRK.B", Name = "BERKSHIRE HATHAWAY, INC.", SecurityCode = "Stocks" },
                new {Id = "CMCSA", Name = "COMCAST CORP.", SecurityCode = "Stocks" },
                new {Id = "COST", Name = "COSTCO WHOLESALE CORP.", SecurityCode = "Stocks" },
                new {Id = "CRM", Name = "SALESFORCE.COM, INC.", SecurityCode = "Stocks" },
                new {Id = "CSCO", Name = "CISCO SYSTEMS, INC.", SecurityCode = "Stocks" },
                new {Id = "CVX", Name = "CHEVRON CORP.", SecurityCode = "Stocks" },
                new {Id = "DIS", Name = "THE WALT DISNEY CO.", SecurityCode = "Stocks" },
                new {Id = "GOOG", Name = "ALPHABET, INC.", SecurityCode = "Stocks" },
                new {Id = "GOOGL", Name = "ALPHABET, INC.", SecurityCode = "Stocks" },
                new {Id = "HD", Name = "THE HOME DEPOT, INC.", SecurityCode = "Stocks" },
                new {Id = "INTC", Name = "INTEL CORP.", SecurityCode = "Stocks" },
                new {Id = "IVV", Name = "ISHARES S&P 500 INDEX FUND", SecurityCode = "Stocks" },
                new {Id = "IWD", Name = "ISHARES RUSSELL 1000 VALUE INDEX FUND", SecurityCode = "Stocks" },
                new {Id = "IWF", Name = "ISHARES RUSSELL 1000 GROWTH INDEX FUND", SecurityCode = "Stocks" },
                new {Id = "JNJ", Name = "JOHNSON & JOHNSON", SecurityCode = "Stocks" },
                new {Id = "JPM", Name = "JPMORGAN CHASE & CO.", SecurityCode = "Stocks" },
                new {Id = "KO", Name = "THE COCA-COLA CO.", SecurityCode = "Stocks" },
                new {Id = "LLY", Name = "ELI LILLY & CO.", SecurityCode = "Stocks" },
                new {Id = "MA", Name = "MASTERCARD, INC.", SecurityCode = "Stocks" },
                new {Id = "MCD", Name = "MCDONALD'S CORP.", SecurityCode = "Stocks" },
                new {Id = "META", Name = "FACEBOOK, INC.", SecurityCode = "Stocks" },
                new {Id = "MRK", Name = "MERCK & CO., INC.", SecurityCode = "Stocks" },
                new {Id = "MSFT", Name = "MICROSOFT CORP.", SecurityCode = "Stocks" },
                new {Id = "NKE", Name = "NIKE, INC.", SecurityCode = "Stocks" },
                new {Id = "NVDA", Name = "NVIDIA CORP.", SecurityCode = "Stocks" },
                new {Id = "PEP", Name = "PEPSICO, INC.", SecurityCode = "Stocks" },
                new {Id = "PFE", Name = "PFIZER INC.", SecurityCode = "Stocks" },
                new {Id = "PG", Name = "PROCTER & GAMBLE CO.", SecurityCode = "Stocks" },
                new {Id = "PM", Name = "PHILIP MORRIS INTERNATIONAL, INC.", SecurityCode = "Stocks" },
                new {Id = "QCOM", Name = "QUALCOMM, INC.", SecurityCode = "Stocks" },
                new {Id = "QQQ", Name = "NASDAQ 100 SHARES", SecurityCode = "Stocks" },
                new {Id = "TMO", Name = "THERMO FISHER SCIENTIFIC, INC.", SecurityCode = "Stocks" },
                new {Id = "TMUS", Name = "T-MOBILE US, INC.", SecurityCode = "Stocks" },
                new {Id = "TSLA", Name = "TESLA, INC.", SecurityCode = "Stocks" },
                new {Id = "TXN", Name = "TEXAS INSTRUMENTS INCORPORATED", SecurityCode = "Stocks" },
                new {Id = "UNH", Name = "UNITEDHEALTH GROUP, INC.", SecurityCode = "Stocks" },
                new {Id = "UNP", Name = "UNION PACIFIC CORP.", SecurityCode = "Stocks" },
                new {Id = "V", Name = "VISA, INC.", SecurityCode = "Stocks" },
                new {Id = "VTI", Name = "VANGUARD TOTAL STOCK MARKET VIPERS", SecurityCode = "Stocks" },
                new {Id = "VZ", Name = "VERIZON COMMUNICATIONS, INC.", SecurityCode = "Stocks" },
                new {Id = "WFC", Name = "WELLS FARGO & CO.", SecurityCode = "Stocks" },
                new {Id = "WMT", Name = "WALMART, INC.", SecurityCode = "Stocks" },
                new {Id = "XOM", Name = "EXXON MOBIL CORP.", SecurityCode = "Stocks" },
                new {Id = "SPY", Name = "SPDR S&P 500 ETF TRUST", SecurityCode = "ETF" },
                new {Id = "VIG", Name = "VANGUARD DIVIDEND APPRECIATION ETF", SecurityCode = "ETF" },
                new {Id = "VOO", Name = "VANGUARD S&P 500 ETF", SecurityCode = "ETF" },
                new {Id = "VTV", Name = "VANGUARD VALUE ETF", SecurityCode = "ETF" },
                new {Id = "VUG", Name = "VANGUARD GROWTH ETF", SecurityCode = "ETF" }

            };

            //Searching records from list using LINQ query  
            //var Name = (from N in ObjList
            //            where N.Name.StartsWith(searchText)
            //            select new { N.Name });
            //return Json(ObjList.Where(o => o.Name.StartsWith(searchText)), JsonRequestBehavior.AllowGet);
            return Json(ObjList, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult GetSearchResultsUsingDB(string searchText)
        {
            List<dynamic> ObjList = new List<dynamic>();

            // For Stocks use [prod].[V_FS_Company_Industry]
            string sqlquery = string.Format("SELECT Ticker, [Company Name] FROM [prod].[V_FS_Company_Industry] where [Ticker] LIKE '%{0}%' OR [Company Name] LIKE '%{0}%'", searchText);
            // For ETFs use following query
            // select etf_Ticker, etf_Name from V_etf_Composite_Data

            using (SqlConnection connection = new SqlConnection(_connectionString))
            using (SqlCommand sqlcomm = new SqlCommand(sqlquery, connection))
            {
                connection.Open();
                SqlDataReader sdr = sqlcomm.ExecuteReader();
                if (sdr.HasRows)
                    while (sdr.Read())
                        ObjList.Add(new { Id = sdr.GetString(0), Name = sdr.GetString(1), SecurityCode = "Stocks" });
                connection.Close();
            }
            return Json(ObjList, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult GetCompanyRiskRatings(string tickerSymbol = "AAPL")
        {
            dynamic dynamicObj = null;
            using (SqlConnection connection = new SqlConnection(_connectionString))
            using (SqlCommand command = new SqlCommand("prod.spRet_FS_Company_Rating", connection))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.Add(new SqlParameter("@P_Ticker", tickerSymbol));

                connection.Open();
                SqlDataReader reader = command.ExecuteReader();
                if (reader.Read())
                {
                    dynamicObj = new
                    {
                        Sector = reader.GetString(0),
                        Industry = reader.GetString(1),
                        SubIndustry = reader.GetString(2),
                        Ticker = reader.GetString(3),
                        CompanyName = reader.GetString(4),
                        ESG = reader.GetString(5),
                        EsgE = reader.GetString(6),
                        EsgS = reader.GetString(7),
                        EsgG = reader.GetString(8),
                        SubIndustryRating = reader.GetString(9),
                        IndustryRating = reader.GetString(10),
                        SectorRating = reader.GetString(11),
                        AinsteinRating = reader.GetString(12),
                        PerformanceRating = reader.GetString(13),
                        ValueRating = reader.GetString(14),
                        CurrentPERating = reader.GetString(15),
                        CurrentPEGRating = reader.GetString(16),
                        NextPERating = reader.GetString(17),
                        NextPEGRating = reader.GetString(18),
                        EarningsRating = reader.GetString(19),
                        RevenueRating = reader.GetString(20),
                        CashFlowRating = reader.GetString(21),
                        GrowthRating = reader.GetString(22),
                        MarginRating = reader.GetString(23),
                        PEMultiple = reader.GetDouble(24),
                        MarketValue = reader.GetDouble(25),
                        EarningsGrowth = reader.GetDouble(26)
                    };
                }
            }
            return dynamicObj == null? null: Json(dynamicObj, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public string GetETF(string term, string columnName)
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["dbConnection"].ConnectionString;
            SqlConnection connection = new SqlConnection(connectionString);
            connection.Open();
            string sqlquery = string.Format("SELECT [{0}] FROM [dbo].[ETF-Issuer] where [{0}] LIKE '%{1}%'", columnName, term);
            SqlCommand sqlcomm = new SqlCommand(sqlquery, connection);
            SqlDataReader sdr = sqlcomm.ExecuteReader();
            DataTable dt = new DataTable();
            dt.Columns.Add("id", typeof(string));
            dt.Columns.Add("label", typeof(string));
            dt.Columns.Add("value", typeof(string));
            while (sdr.Read())
            {
                dt.Rows.Add(sdr.GetString(0), sdr.GetString(0), sdr.GetString(0));
            }
            connection.Close();

            var json = JsonConvert.SerializeObject(dt);

            return json;
        }

        [HttpGet]
        public string GetCompany(string term)
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["dbConnection"].ConnectionString;
            SqlConnection connection = new SqlConnection(connectionString);
            // using (SqlConnection connection = new SqlConnection(connectionString))

            connection.Open();

            string sqlquery = string.Format("SELECT a.* FROM [dbo].[TICKER_mapping] a WHERE a.COMPANY_FULL_NAME LIKE '%{0}%' ORDER BY (CASE WHEN a.EPD_ticker = '{0}' THEN 1 ELSE 2 END), a.COMPANY_FULL_NAME", term);
            SqlCommand sqlcomm = new SqlCommand(sqlquery, connection);
            SqlDataReader sdr = sqlcomm.ExecuteReader();
            DataTable dt = new DataTable();
            dt.Columns.Add("id", typeof(string));
            dt.Columns.Add("label", typeof(string));
            dt.Columns.Add("value", typeof(string));
            while (sdr.Read())
            {
                dt.Rows.Add(sdr.GetString(0), sdr.GetString(2), sdr.GetString(1));
            }
            connection.Close();

            var json = JsonConvert.SerializeObject(dt);

            return json;
        }

        [HttpGet]
        public string GetETFPortfolioIds(string term)
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["dbConnection"].ConnectionString;
            SqlConnection connection = new SqlConnection(connectionString);

            connection.Open();

            string sqlquery = string.Format("SELECT DISTINCT[PORTFOLIOID] from [dbo].[TMP_CUBE_DATA_ETF] where [PORTFOLIOID] like '{0}%'", term);
            SqlCommand sqlcomm = new SqlCommand(sqlquery, connection);
            SqlDataReader sdr = sqlcomm.ExecuteReader();
            DataTable dt = new DataTable();
            dt.Columns.Add("id", typeof(string));
            dt.Columns.Add("label", typeof(string));
            dt.Columns.Add("value", typeof(string));
            int coutner = 0;
            while (sdr.Read())
            {
                dt.Rows.Add(coutner, sdr.GetString(0), sdr.GetString(0));
                coutner++;
            }
            connection.Close();

            var json = JsonConvert.SerializeObject(dt);

            return json;
        }

        // GET: API/v1/Cube
        public string Cube(string id)
        {
            //return cube result for portfolioId id

            // KM2do -- get value from vault -- make this a service function and use throughout for GUIDs, etc.
            // see https://docs.microsoft.com/en-us/azure/key-vault/general/tutorial-net-create-vault-azure-web-app
            // see https://docs.microsoft.com/en-us/azure/key-vault/secrets/quick-create-net

            //            string keyVaultName = Environment.GetEnvironmentVariable("AI_VAULT_SPACE");
            //            var kvUri = "https://" + keyVaultName + ".vault.azure.net";
            //
            //            var client = new SecretClient(new Uri(kvUri), new DefaultAzureCredential());
            //            var secret = await client.GetSecretAsync("dbConnection");
            //            var secret = client.GetSecretAsync("dbConnection");

            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["dbConnection"].ConnectionString;
            System.Data.DataTable dt = new System.Data.DataTable();

            //           string userid = GetActiveUser().UserID;
            //           string userAppName = System.Configuration.ConfigurationManager.AppSettings["appName"];

            using (SqlConnection connection = new SqlConnection(connectionString))
            {

                connection.Open();
                using (SqlCommand command = new SqlCommand("dbo.spGetCube_by_PortfolioID", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.Add(new SqlParameter("@P_Portfolio_ID", id));
                    command.Parameters.Add(new SqlParameter("@P_Seqtycd", "EQS"));
                    command.Parameters.Add(new SqlParameter("@P_Cube_Type", "Portfolio"));

                    SqlDataReader reader = command.ExecuteReader(CommandBehavior.CloseConnection);
                    if (reader.HasRows)
                    {
                        dt.Load(reader);
                    }
                }
            }
            //            Cube theCube = new Cube();
            //            theCube.ComponentsTable = dt;
            return "{\"data\": " + DataTableToJSONWithJavaScriptSerializer(dt) + "}";
            //            return theCube;
        }


        // GET: API/v1/ETFCube
        public string ETFCube(string id)
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["dbConnection"].ConnectionString;
            System.Data.DataTable dt = new System.Data.DataTable();

            using (SqlConnection connection = new SqlConnection(connectionString))
            {

                connection.Open();
                using (SqlCommand command = new SqlCommand("dbo.spGetCube_by_PortfolioID", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.Add(new SqlParameter("@P_Portfolio_ID", id));
                    command.Parameters.Add(new SqlParameter("@P_Seqtycd", "ETF"));
                    command.Parameters.Add(new SqlParameter("@P_Cube_Type", "ETF"));

                    SqlDataReader reader = command.ExecuteReader(CommandBehavior.CloseConnection);
                    if (reader.HasRows)
                    {
                        dt.Load(reader);
                    }
                }
            }
            return "{\"data\": " + DataTableToJSONWithJavaScriptSerializer(dt) + "}";
        }


        // GET: API/v1/Vector
        public string Vector(string id)
        {
            //return vector results for tickerSymbol id

            // KM2do -- get value from vault -- see Cube API function for details

            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["dbConnection"].ConnectionString;
            System.Data.DataTable dt = new System.Data.DataTable();

            //using (SqlConnection connection = new SqlConnection(connectionString))
            //{
            //    connection.Open();
            //    using (SqlCommand command = new SqlCommand("dbo.Get_Vector_by_Ticker_Symbol", connection))
            //    {
            //        command.CommandType = CommandType.StoredProcedure;
            //        command.Parameters.Add(new SqlParameter("@ticker", id));
            //        SqlDataReader reader = command.ExecuteReader(CommandBehavior.CloseConnection);
            //        if (reader.HasRows)
            //        {
            //            dt.Load(reader);
            //        }
            //    }
            //}

            // unrem later so we use the results
            //            return "{\"data\": " + DataTableToJSONWithJavaScriptSerializer(dt) + "}";
            // but for now, just return junk
            return "foo";
        }

        public string DataTableToJSONWithJavaScriptSerializer(DataTable table)
        {
            JavaScriptSerializer jsSerializer = new JavaScriptSerializer();
            List<Dictionary<string, object>> parentRow = new List<Dictionary<string, object>>();
            Dictionary<string, object> childRow;
            foreach (DataRow row in table.Rows)
            {
                childRow = new Dictionary<string, object>();
                foreach (DataColumn col in table.Columns)
                {
                    childRow.Add(col.ColumnName, row[col]);
                }
                parentRow.Add(childRow);
            }
            return jsSerializer.Serialize(parentRow);
        }
    }
}